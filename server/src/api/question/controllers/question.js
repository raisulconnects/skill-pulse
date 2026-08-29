'use strict';

/**
 * Question controller with role-based access control, validation, and ownership enforcement.
 * Phase 1: Authoring only.
 * - Exactly 4 non-empty options required
 * - correct_option must be one of the 4 options
 * - Max 10 questions per quiz
 * - Instructor must own the quiz's course
 */

const { createCoreController } = require('@strapi/strapi').factories;

const MAX_QUESTIONS = 10;

/**
 * Resolve a quiz from documentId or numeric id.
 */
async function resolveQuiz(strapi, quizId) {
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
  return quiz;
}

/**
 * Validate question payload.
 * Returns null if valid, or an error message string.
 */
function validateQuestionPayload(data) {
  if (!data.question_text || String(data.question_text).trim() === '') {
    return 'Question text is required';
  }

  const options = data.options;
  if (!Array.isArray(options) || options.length !== 4) {
    return 'Exactly 4 options are required';
  }

  for (let i = 0; i < 4; i++) {
    if (typeof options[i] !== 'string' || options[i].trim() === '') {
      return `Option ${i + 1} cannot be empty`;
    }
  }

  if (!data.correct_option || String(data.correct_option).trim() === '') {
    return 'A correct option must be selected';
  }

  if (!options.includes(data.correct_option)) {
    return 'The correct option must be one of the 4 provided options';
  }

  return null;
}

module.exports = createCoreController('api::question.question', ({ strapi }) => ({

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view questions');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot access question authoring');
    }

    const query = { ...ctx.query };
    query.populate = query.populate || {
      quiz: {
        fields: ['id', 'documentId', 'title'],
        populate: { course: { populate: ['instructor'] } },
      },
    };

    ctx.query = query;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot access question authoring');
    }

    ctx.query.populate = ctx.query.populate || {
      quiz: { populate: { course: { populate: ['instructor'] } } },
    };

    return await super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to create a question');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot create questions');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    // Validate payload
    const validationError = validateQuestionPayload(data);
    if (validationError) {
      return ctx.badRequest(validationError);
    }

    // Require quiz id
    const quizId = data.quiz;
    if (!quizId) {
      return ctx.badRequest('Quiz ID is required to create a question');
    }

    const quiz = await resolveQuiz(strapi, quizId);
    if (!quiz) {
      return ctx.notFound('Quiz not found');
    }

    // Enforce instructor ownership
    if (role === 'instructor') {
      const instructorId = quiz.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only add questions to quizzes in your own courses');
      }
    }

    // Enforce max 10 questions
    const existingCount = await strapi.db.query('api::question.question').count({
      where: { quiz: { id: quiz.id } },
    });

    if (existingCount >= MAX_QUESTIONS) {
      return ctx.badRequest(`A quiz cannot have more than ${MAX_QUESTIONS} questions`);
    }

    // Trim values
    data.question_text = String(data.question_text).trim();
    data.options = data.options.map((o) => String(o).trim());
    data.correct_option = String(data.correct_option).trim();

    // Auto-publish
    data.publishedAt = new Date().toISOString();

    ctx.request.body = { data };
    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to update a question');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot update questions');
    }

    const { id } = ctx.params;

    // Fetch existing question
    let existing = null;
    try {
      existing = await strapi.documents('api::question.question').findOne({
        documentId: id,
        populate: { quiz: { populate: { course: { populate: ['instructor'] } } } },
      });
    } catch {
      existing = await strapi.db.query('api::question.question').findOne({
        where: { id },
        populate: { quiz: { populate: { course: { populate: ['instructor'] } } } },
      });
    }

    if (!existing) return ctx.notFound('Question not found');

    if (role === 'instructor') {
      const instructorId = existing.quiz?.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only edit questions belonging to your own courses');
      }
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    // Validate updated payload
    const validationError = validateQuestionPayload(data);
    if (validationError) {
      return ctx.badRequest(validationError);
    }

    // Trim values
    data.question_text = String(data.question_text).trim();
    data.options = data.options.map((o) => String(o).trim());
    data.correct_option = String(data.correct_option).trim();

    // Never allow changing the quiz via update
    delete data.quiz;

    ctx.request.body = { data };
    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to delete a question');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot delete questions');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::question.question').findOne({
        documentId: id,
        populate: { quiz: { populate: { course: { populate: ['instructor'] } } } },
      });
    } catch {
      existing = await strapi.db.query('api::question.question').findOne({
        where: { id },
        populate: { quiz: { populate: { course: { populate: ['instructor'] } } } },
      });
    }

    if (!existing) return ctx.notFound('Question not found');

    if (role === 'instructor') {
      const instructorId = existing.quiz?.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only delete questions belonging to your own courses');
      }
    }

    return await super.delete(ctx);
  },
}));
