'use strict';

/**
 * Enrollment controller with duplicate checks and student binding.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to view enrollments');
    }

    const role = user.user_role;
    const query = { ...ctx.query };
    query.populate = query.populate || {
      course: {
        populate: {
          instructor: { fields: ['id', 'username', 'email'] },
          thumbnail: true,
        },
      },
      student: {
        fields: ['id', 'username', 'email'],
      },
    };

    if (role === 'student') {
      query.filters = {
        ...(query.filters || {}),
        student: { id: user.id },
      };
    } else if (role === 'instructor') {
      query.filters = {
        ...(query.filters || {}),
        course: {
          instructor: { id: user.id },
        },
      };
    }

    ctx.query = query;
    return await super.find(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to enroll in a course');
    }

    const role = user.user_role;
    if (role !== 'student' && role !== 'admin') {
      return ctx.badRequest('Only students can enroll in courses');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    const courseId = data.course;
    if (!courseId) {
      return ctx.badRequest('Course ID is required to enroll');
    }

    // 1. Verify course exists
    let course = null;
    try {
      course = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
      });
    } catch {
      course = await strapi.db.query('api::course.course').findOne({
        where: { id: courseId },
      });
    }

    if (!course) {
      // Try resolving by numeric id or documentId
      course = await strapi.db.query('api::course.course').findOne({
        where: { id: courseId },
      });
    }

    if (!course) {
      return ctx.notFound('Course not found');
    }

    // 2. Prevent duplicate enrollment
    const existingEnrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: {
        student: user.id,
        $or: [
          { course: course.id },
          ...(course.documentId ? [{ course: { documentId: course.documentId } }] : []),
        ],
      },
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      return ctx.badRequest('You are already enrolled in this course');
    }

    // 3. Set student and enrollment date
    data.student = user.id;
    data.course = course.id;
    data.enrollment_date = data.enrollment_date || new Date().toISOString();

    ctx.request.body = { data };
    return await super.create(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to view an enrollment');
    }

    const role = user.user_role;
    const { id } = ctx.params;

    let enrollment = null;
    try {
      enrollment = await strapi.documents('api::enrollment.enrollment').findOne({
        documentId: id,
        populate: {
          course: { populate: ['instructor'] },
          student: { fields: ['id', 'username', 'email'] },
        },
      });
    } catch {
      enrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
        where: { id },
        populate: {
          course: { populate: ['instructor'] },
          student: { fields: ['id', 'username', 'email'] },
        },
      });
    }

    if (!enrollment) {
      return ctx.notFound('Enrollment record not found');
    }

    if (role === 'student') {
      const studentId = enrollment.student?.id || enrollment.student;
      if (studentId !== user.id) {
        return ctx.forbidden('You can only view your own enrollment record');
      }
    } else if (role === 'instructor') {
      const instructorId = enrollment.course?.instructor?.id || enrollment.course?.instructor;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only view enrollment records for your own courses');
      }
    }

    ctx.query.populate = ctx.query.populate || {
      course: {
        populate: { instructor: { fields: ['id', 'username', 'email'] } },
      },
      student: { fields: ['id', 'username', 'email'] },
    };

    return await super.findOne(ctx);
  },
}));
