'use strict';

/**
 * Quiz controller with role-based access control and course ownership enforcement.
 * Phase 1: Authoring only. Student quiz-taking API is NOT implemented here.
 * correctOption is available for authors; future student API must omit it.
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
      // Students cannot access quiz authoring list
      return ctx.forbidden('Students cannot access quiz management');
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
}));
