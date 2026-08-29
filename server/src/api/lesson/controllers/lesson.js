'use strict';

/**
 * Lesson controller with role-based access control and course ownership enforcement.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view lessons');
    }

    const role = user.user_role;
    const query = { ...ctx.query };

    // Default sorting by lesson_order ascending
    if (!query.sort) {
      query.sort = ['lesson_order:asc', 'id:asc'];
    }

    // Default populate
    query.populate = query.populate || {
      course: {
        fields: ['id', 'title', 'course_status'],
        populate: { instructor: { fields: ['id', 'username'] } },
      },
    };

    // Extract requested course filter if present
    const courseId =
      query.filters?.course?.id ||
      query.filters?.course ||
      query.course;

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

      // Student enrollment check
      if (role === 'student') {
        if (!courseObj) {
          return ctx.notFound('Course not found');
        }

        // Check if student is enrolled in this course
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
          return ctx.forbidden('You must be enrolled in this course to view its lessons');
        }
      }
    }

    ctx.query = query;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view a lesson');
    }

    const role = user.user_role;
    const { id } = ctx.params;

    let lesson = null;
    try {
      lesson = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: {
          course: {
            populate: ['instructor', 'enrollments'],
          },
        },
      });
    } catch {
      lesson = await strapi.db.query('api::lesson.lesson').findOne({
        where: { id },
        populate: {
          course: {
            populate: ['instructor', 'enrollments'],
          },
        },
      });
    }

    if (!lesson) {
      return ctx.notFound('Lesson not found');
    }

    const course = lesson.course;

    // Student enrollment validation
    if (role === 'student') {
      if (!course) {
        return ctx.forbidden('Lesson does not belong to a valid course');
      }

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
        return ctx.forbidden('You must be enrolled in this course to view this lesson');
      }
    }

    // Instructor ownership check
    if (role === 'instructor' && course) {
      const instructorId = course.instructor?.id;
      const isOwner = instructorId === user.id;
      const isPublished = course.course_status === 'published';

      if (!isOwner && !isPublished) {
        return ctx.forbidden('You do not have access to view this lesson');
      }
    }

    ctx.query.populate = ctx.query.populate || {
      course: {
        populate: ['instructor'],
      },
    };

    return await super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to create a lesson');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students are not permitted to create lessons');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    const courseId = data.course;
    if (!courseId) {
      return ctx.badRequest('Course ID is required to create a lesson');
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
      const courseInstructorId = targetCourse.instructor?.id;
      if (courseInstructorId !== user.id) {
        return ctx.forbidden('You can only create lessons inside your own courses');
      }
    }

    // Format text description to Strapi block format if string passed
    if (typeof data.description === 'string') {
      data.description = [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: data.description }],
        },
      ];
    }

    // Set default lesson order if not provided
    if (typeof data.lesson_order !== 'number') {
      data.lesson_order = parseInt(data.lesson_order, 10) || 1;
    }

    ctx.request.body = { data };
    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to update a lesson');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot update lessons');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: { course: { populate: ['instructor'] } },
      });
    } catch {
      existing = await strapi.db.query('api::lesson.lesson').findOne({
        where: { id },
        populate: { course: { populate: ['instructor'] } },
      });
    }

    if (!existing) {
      return ctx.notFound('Lesson not found');
    }

    if (role === 'instructor') {
      const instructorId = existing.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only edit lessons belonging to your own courses');
      }
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    if (typeof data.description === 'string') {
      data.description = [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: data.description }],
        },
      ];
    }

    if (data.lesson_order !== undefined) {
      data.lesson_order = parseInt(data.lesson_order, 10) || existing.lesson_order || 1;
    }

    ctx.request.body = { data };
    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to delete a lesson');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot delete lessons');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: { course: { populate: ['instructor'] } },
      });
    } catch {
      existing = await strapi.db.query('api::lesson.lesson').findOne({
        where: { id },
        populate: { course: { populate: ['instructor'] } },
      });
    }

    if (!existing) {
      return ctx.notFound('Lesson not found');
    }

    if (role === 'instructor') {
      const instructorId = existing.course?.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only delete lessons belonging to your own courses');
      }
    }

    return await super.delete(ctx);
  },
}));
