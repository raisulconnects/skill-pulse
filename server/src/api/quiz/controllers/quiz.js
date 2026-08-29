'use strict';

/**
 * Quiz controller with role-based access control, course ownership enforcement,
 * and Student Quiz Taking (Phase 2).
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz.quiz', ({ strapi }) => ({

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view quizzes');
    }

    const role = user.user_role;
    const query = { ...ctx.query };

    // Default populate: course + author + question count
    query.populate = query.populate || {
      course: { fields: ['id', 'documentId', 'title', 'course_status'], populate: { instructor: { fields: ['id', 'username'] } } },
      author: { fields: ['id', 'username'] },
      questions: { fields: ['id', 'documentId', 'question_text'] },
    };

    // Extract course filter from query
    const courseId =
      query.filters?.course?.id ||
      query.filters?.course?.documentId ||
      query.filters?.course ||
      query.courseId;

    if (role === 'instructor') {
      // Instructors can only see quizzes for their own courses
      if (courseId) {
        let courseObj = null;
        try {
          courseObj = await strapi.documents('api::course.course').findOne({
            documentId: courseId,
            populate: ['instructor'],
          });
        } catch {
          courseObj = await strapi.db.query('api::course.course').findOne({
            where: { id: courseId },
            populate: ['instructor'],
          });
        }
        if (!courseObj) return ctx.notFound('Course not found');
        if (courseObj.instructor?.id !== user.id) {
          return ctx.forbidden('You can only view quizzes for your own courses');
        }
      } else {
        // Without a course filter, restrict to quizzes authored by this instructor
        query.filters = { ...query.filters, author: { id: { $eq: user.id } } };
      }
    }

    if (role === 'student') {
      if (!courseId) {
        return ctx.forbidden('Students cannot access global quiz management list');
      }

      // Check student enrollment in the course
      let courseObj = null;
      try {
        courseObj = await strapi.documents('api::course.course').findOne({
          documentId: courseId,
        });
      } catch {
        courseObj = await strapi.db.query('api::course.course').findOne({
          where: { id: courseId },
        });
      }

      if (!courseObj) return ctx.notFound('Course not found');

      const studentId = user.id;
      const targetCourseId = courseObj.id;
      const targetDocId = courseObj.documentId;

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
        return ctx.forbidden('You must be enrolled in this course to view its quizzes');
      }

      // Ensure correct_option is NEVER exposed
      query.populate = {
        course: { fields: ['id', 'documentId', 'title'] },
        questions: { fields: ['id', 'documentId', 'question_text'] },
      };
    }

    ctx.query = query;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view a quiz');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot access quiz authoring');
    }

    const { id } = ctx.params;

    let quiz = null;
    try {
      quiz = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: {
          course: { populate: ['instructor'] },
          author: { fields: ['id', 'username'] },
          questions: { fields: ['id', 'documentId', 'question_text', 'options', 'correct_option'] },
        },
      });
    } catch {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id },
        populate: {
          course: { populate: ['instructor'] },
          author: true,
          questions: true,
        },
      });
    }

    if (!quiz) return ctx.notFound('Quiz not found');

    if (role === 'instructor') {
      const instructorId = quiz.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only view quizzes for your own courses');
      }
    }

    ctx.query.populate = ctx.query.populate || {
      course: { populate: ['instructor'] },
      author: { fields: ['id', 'username'] },
      questions: { fields: ['id', 'documentId', 'question_text', 'options', 'correct_option'] },
    };

    return await super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to create a quiz');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot create quizzes');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    const courseId = data.course;
    if (!courseId) {
      return ctx.badRequest('Course ID is required to create a quiz');
    }

    // Fetch target course
    let targetCourse = null;
    try {
      targetCourse = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor'],
      });
    } catch {
      targetCourse = await strapi.db.query('api::course.course').findOne({
        where: { id: courseId },
        populate: ['instructor'],
      });
    }

    if (!targetCourse) {
      return ctx.notFound('Specified course was not found');
    }

    // Enforce instructor ownership
    if (role === 'instructor') {
      if (targetCourse.instructor?.id !== user.id) {
        return ctx.forbidden('You can only create quizzes for your own courses');
      }
    }

    // Always set author to authenticated user
    data.author = user.id;

    // Auto-publish
    data.publishedAt = new Date().toISOString();

    ctx.request.body = { data };
    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to update a quiz');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot update quizzes');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: { course: { populate: ['instructor'] } },
      });
    } catch {
      existing = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id },
        populate: { course: { populate: ['instructor'] } },
      });
    }

    if (!existing) return ctx.notFound('Quiz not found');

    if (role === 'instructor') {
      const instructorId = existing.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only edit quizzes belonging to your own courses');
      }
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    // Never allow changing author or course via update
    delete data.author;

    ctx.request.body = { data };
    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to delete a quiz');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot delete quizzes');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: { course: { populate: ['instructor'] }, questions: true },
      });
    } catch {
      existing = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id },
        populate: { course: { populate: ['instructor'] }, questions: true },
      });
    }

    if (!existing) return ctx.notFound('Quiz not found');

    if (role === 'instructor') {
      const instructorId = existing.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only delete quizzes belonging to your own courses');
      }
    }

    // Cascade delete questions
    if (Array.isArray(existing.questions) && existing.questions.length > 0) {
      for (const q of existing.questions) {
        try {
          if (q.documentId) {
            await strapi.documents('api::question.question').delete({ documentId: q.documentId });
          } else {
            await strapi.db.query('api::question.question').delete({ where: { id: q.id } });
          }
        } catch (err) {
          strapi.log.warn(`Failed to delete question ${q.id} during quiz deletion:`, err?.message);
        }
      }
    }

    return await super.delete(ctx);
  },

  // =========================================================================
  // PHASE 2: Student Quiz Taking Endpoints
  // =========================================================================

  /**
   * GET /api/quizzes/:id/take
   * Returns quiz metadata and questions for student taking.
   * ABSOLUTELY MUST NOT EXPOSE correct_option.
   */
  async getQuizForStudent(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to take a quiz');
    }

    const role = user.user_role;
    if (role !== 'student') {
      return ctx.forbidden('Only students can use the quiz-taking flow');
    }

    const { id } = ctx.params;

    let quiz = null;
    try {
      quiz = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: {
          course: true,
          questions: { fields: ['id', 'documentId', 'question_text', 'options'] },
        },
      });
    } catch {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id },
        populate: ['course', 'questions'],
      });
    }

    if (!quiz) {
      return ctx.notFound('Quiz not found');
    }

    const course = quiz.course;
    if (!course) {
      return ctx.badRequest('Quiz does not belong to a valid course');
    }

    // Verify student enrollment in course
    const studentId = user.id;
    const targetCourseId = course.id;
    const targetDocId = course.documentId;

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
      return ctx.forbidden('You must be enrolled in this course to take this quiz');
    }

    const questions = quiz.questions || [];
    if (questions.length === 0) {
      return ctx.badRequest('This quiz does not have any questions available yet');
    }

    // Sanitize questions: STRICTLY STRIP correct_option
    const sanitizedQuestions = questions.map((q, idx) => ({
      id: String(q.documentId || q.id),
      order: idx + 1,
      question_text: q.question_text,
      options: Array.isArray(q.options) ? q.options : [],
    }));

    return ctx.send({
      data: {
        id: String(quiz.documentId || quiz.id),
        title: quiz.title,
        course: {
          id: String(course.documentId || course.id),
          title: course.title,
        },
        questions: sanitizedQuestions,
        total_questions: sanitizedQuestions.length,
      },
    });
  },

  /**
   * POST /api/quizzes/:id/submit
   * Evaluates student submitted answers against server-side correct_option values.
   * Calculates score, creates QuizAttempt record, and returns immediate result.
   */
  async submitQuiz(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to submit a quiz');
    }

    const role = user.user_role;
    if (role !== 'student') {
      return ctx.forbidden('Only students can submit quiz attempts');
    }

    const { id } = ctx.params;

    let quiz = null;
    try {
      quiz = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: {
          course: true,
          questions: { fields: ['id', 'documentId', 'question_text', 'options', 'correct_option'] },
        },
      });
    } catch {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id },
        populate: ['course', 'questions'],
      });
    }

    if (!quiz) {
      return ctx.notFound('Quiz not found');
    }

    const course = quiz.course;
    if (!course) {
      return ctx.badRequest('Quiz does not belong to a valid course');
    }

    // Verify student enrollment in course
    const studentId = user.id;
    const targetCourseId = course.id;
    const targetDocId = course.documentId;

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
      return ctx.forbidden('You must be enrolled in this course to submit this quiz');
    }

    const body = ctx.request.body || {};
    const payload = body.data || body;
    const submittedAnswers = Array.isArray(payload.answers) ? payload.answers : [];

    if (submittedAnswers.length === 0) {
      return ctx.badRequest('No answers provided for submission');
    }

    const questions = quiz.questions || [];
    if (questions.length === 0) {
      return ctx.badRequest('This quiz has no questions');
    }

    // Calculate score server-side
    let score = 0;
    const evaluatedAnswers = [];

    for (const q of questions) {
      const qId = String(q.documentId || q.id);
      const studentAns = submittedAnswers.find(
        (a) => String(a.questionId || a.question || a.id) === qId
      );

      const submittedOption = studentAns ? String(studentAns.answer || studentAns.selectedOption || '').trim() : '';
      const correctOption = String(q.correct_option || '').trim();
      const isCorrect = submittedOption !== '' && submittedOption === correctOption;

      if (isCorrect) {
        score += 1;
      }

      evaluatedAnswers.push({
        questionId: qId,
        answer: submittedOption,
        isCorrect: isCorrect,
      });
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Create QuizAttempt record
    const attemptData = {
      student: user.id,
      quiz: quiz.id || quiz.documentId,
      score: score,
      answers: evaluatedAnswers,
      submitted_at: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    let attempt = null;
    try {
      attempt = await strapi.documents('api::quiz-attempt.quiz-attempt').create({
        data: attemptData,
      });
    } catch (err) {
      try {
        attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
          data: attemptData,
        });
      } catch (dbErr) {
        strapi.log.error('Failed to create quiz attempt:', dbErr?.message || err?.message);
      }
    }

    return ctx.send({
      data: {
        attemptId: attempt?.documentId || attempt?.id || null,
        quizId: String(quiz.documentId || quiz.id),
        quizTitle: quiz.title,
        score: score,
        total_questions: totalQuestions,
        percentage: percentage,
        submitted_at: attemptData.submitted_at,
      },
    });
  },
}));
