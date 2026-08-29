'use strict';

/**
 * QuizAttempt controller with role-based access control, answer review enrichment,
 * student ownership enforcement, and instructor course ownership checks.
 */

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Helper to resolve a QuizAttempt by documentId or numeric id.
 */
async function resolveAttempt(strapi, id) {
  let attempt = null;
  try {
    attempt = await strapi.documents('api::quiz-attempt.quiz-attempt').findOne({
      documentId: id,
      populate: {
        student: { fields: ['id', 'username', 'email'] },
        quiz: {
          populate: {
            course: { populate: ['instructor'] },
            questions: { fields: ['id', 'documentId', 'question_text', 'options', 'correct_option'] },
          },
        },
      },
    });
  } catch {
    attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').findOne({
      where: { id },
      populate: {
        student: true,
        quiz: {
          populate: {
            course: { populate: ['instructor'] },
            questions: true,
          },
        },
      },
    });
  }
  return attempt;
}

module.exports = createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view quiz attempts');
    }

    const role = user.user_role;
    const query = { ...ctx.query };

    // Default sorting by submitted_at descending
    if (!query.sort) {
      query.sort = ['submitted_at:desc', 'id:desc'];
    }

    query.populate = query.populate || {
      student: { fields: ['id', 'username', 'email'] },
      quiz: {
        fields: ['id', 'documentId', 'title'],
        populate: { course: { fields: ['id', 'documentId', 'title'] } },
      },
    };

    if (role === 'student') {
      // Students can ONLY see their own attempts
      query.filters = {
        ...query.filters,
        student: { id: { $eq: user.id } },
      };
    } else if (role === 'instructor') {
      // Instructors can ONLY see attempts for quizzes belonging to courses they own
      query.filters = {
        ...query.filters,
        quiz: {
          course: {
            instructor: { id: { $eq: user.id } },
          },
        },
      };
    }

    ctx.query = query;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view a quiz attempt');
    }

    const role = user.user_role;
    const { id } = ctx.params;

    const attempt = await resolveAttempt(strapi, id);
    if (!attempt) {
      return ctx.notFound('Quiz attempt not found');
    }

    // Role-based authorization check
    if (role === 'student') {
      if (attempt.student?.id !== user.id) {
        return ctx.forbidden('You can only view your own quiz attempts');
      }
    } else if (role === 'instructor') {
      const courseInstructorId = attempt.quiz?.course?.instructor?.id;
      if (courseInstructorId !== user.id) {
        return ctx.forbidden('You can only view quiz attempts for your own courses');
      }
    }

    // Construct enriched answer review payload
    const quizQuestions = attempt.quiz?.questions || [];
    const submittedAnswers = Array.isArray(attempt.answers) ? attempt.answers : [];

    const reviewQuestions = quizQuestions.map((q, idx) => {
      const qId = String(q.documentId || q.id);
      const studentAns = submittedAnswers.find(
        (a) => String(a.questionId || a.question || a.id) === qId
      );

      const selectedOption = studentAns ? String(studentAns.answer || studentAns.selectedOption || '').trim() : '';
      const correctOption = String(q.correct_option || '').trim();
      const isCorrect = selectedOption !== '' && selectedOption === correctOption;

      return {
        id: qId,
        order: idx + 1,
        question_text: q.question_text,
        options: Array.isArray(q.options) ? q.options : [],
        selected_answer: selectedOption,
        correct_option: correctOption,
        is_correct: isCorrect,
      };
    });

    const totalQuestions = reviewQuestions.length;
    const score = attempt.score ?? 0;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return ctx.send({
      data: {
        id: String(attempt.documentId || attempt.id),
        score: score,
        total_questions: totalQuestions,
        correct_count: score,
        incorrect_count: totalQuestions - score,
        percentage: percentage,
        submitted_at: attempt.submitted_at,
        student: {
          id: attempt.student?.id,
          username: attempt.student?.username || 'Student',
          email: attempt.student?.email || '',
        },
        quiz: {
          id: String(attempt.quiz?.documentId || attempt.quiz?.id),
          title: attempt.quiz?.title || 'Quiz',
          course: {
            id: String(attempt.quiz?.course?.documentId || attempt.quiz?.course?.id),
            title: attempt.quiz?.course?.title || 'Course',
          },
        },
        review_questions: reviewQuestions,
      },
    });
  },

  /**
   * GET /api/quiz-attempts/quiz/:quizId
   * Returns list of attempts for a specific quiz with role authorization.
   */
  async getQuizAttemptsForQuiz(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view quiz attempts');
    }

    const role = user.user_role;
    const { quizId } = ctx.params;

    // Resolve quiz
    let quiz = null;
    try {
      quiz = await strapi.documents('api::quiz.quiz').findOne({
        documentId: quizId,
        populate: { course: { populate: ['instructor'] }, questions: { fields: ['id'] } },
      });
    } catch {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id: quizId },
        populate: { course: { populate: ['instructor'] }, questions: { fields: ['id'] } },
      });
    }

    if (!quiz) {
      return ctx.notFound('Quiz not found');
    }

    const course = quiz.course;
    const totalQuizQuestions = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

    // Authorization checks
    if (role === 'student') {
      // Verify enrollment
      const studentId = user.id;
      const targetCourseId = course?.id;
      const targetDocId = course?.documentId;

      const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
        where: {
          student: { id: studentId },
          $or: [
            { course: { id: targetCourseId } },
            ...(targetDocId ? [{ course: { documentId: targetDocId } }] : []),
          ],
        },
      });

      if (!enrollments || enrollments.length === 0) {
        return ctx.forbidden('You must be enrolled in this course to view attempt history');
      }
    } else if (role === 'instructor') {
      if (course?.instructor?.id !== user.id) {
        return ctx.forbidden('You can only view quiz results for your own courses');
      }
    }

    // Query attempts
    let attempts = [];
    const whereCondition = {
      quiz: { id: quiz.id },
      ...(role === 'student' ? { student: { id: user.id } } : {}),
    };

    try {
      attempts = await strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
        where: whereCondition,
        populate: ['student'],
        orderBy: { submitted_at: 'desc' },
      });
    } catch (err) {
      strapi.log.error('Error fetching quiz attempts:', err?.message);
    }

    const list = attempts.map((att, idx) => {
      const score = att.score ?? 0;
      const pct = totalQuizQuestions > 0 ? Math.round((score / totalQuizQuestions) * 100) : 0;

      return {
        id: String(att.documentId || att.id),
        attempt_number: attempts.length - idx,
        score: score,
        total_questions: totalQuizQuestions,
        percentage: pct,
        submitted_at: att.submitted_at,
        student: {
          id: att.student?.id,
          username: att.student?.username || 'Student',
          email: att.student?.email || '',
        },
      };
    });

    return ctx.send({
      data: {
        quizId: String(quiz.documentId || quiz.id),
        quizTitle: quiz.title,
        course: {
          id: String(course?.documentId || course?.id),
          title: course?.title,
        },
        attempts: list,
      },
    });
  },

  async create(ctx) {
    // QuizAttempts must ONLY be created via the POST /api/quizzes/:id/submit endpoint,
    // which pins the student to the authenticated session and calculates the score server-side.
    // The raw create endpoint is disabled to prevent student ID or score forgery.
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }
    if (user.user_role !== 'admin') {
      return ctx.forbidden('Quiz attempts must be submitted through the quiz submission endpoint.');
    }
    return await super.create(ctx);
  },

  async update(ctx) {
    // Quiz attempts are immutable once submitted. No role can edit them through the API.
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }
    if (user.user_role !== 'admin') {
      return ctx.forbidden('Quiz attempts cannot be modified after submission.');
    }
    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }
    if (user.user_role !== 'admin') {
      return ctx.forbidden('Only administrators can delete quiz attempt records.');
    }
    return await super.delete(ctx);
  },
}));
