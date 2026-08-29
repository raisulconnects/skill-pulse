'use strict';

/**
 * Course controller with strict role-based access control and ownership enforcement.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.user_role;

    // Read the mine flag BEFORE we overwrite ctx.query
    const rawQuery = ctx.query || {};
    const wantsMine = rawQuery.mine === 'true' || rawQuery.my_courses === 'true';

    const query = { ...rawQuery };

    // Remove custom flags so Strapi core doesn't choke on them
    delete query.mine;
    delete query.my_courses;

    query.populate = query.populate || {
      instructor: {
        fields: ['id', 'username', 'email', 'user_role'],
      },
      thumbnail: true,
      enrollments: {
        populate: { student: { fields: ['id', 'username', 'email'] } },
      },
    };

    if (!user || role === 'student') {
      // Public & students only see published courses
      query.filters = {
        ...(query.filters || {}),
        course_status: 'published',
      };
    } else if (role === 'instructor') {
      if (wantsMine) {
        // Filter to only courses where instructor.id matches the logged-in user
        query.filters = {
          ...(query.filters || {}),
          instructor: { id: { $eq: user.id } },
        };
      }
      // Without mine=true, instructor still only sees their own + all published
      // (leave unfiltered so the browse page works)
    }
    // Admins and Content Managers can view all

    ctx.query = query;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = user?.user_role;

    ctx.query.populate = ctx.query.populate || {
      instructor: {
        fields: ['id', 'username', 'email', 'user_role'],
      },
      thumbnail: true,
      lessons: {
        sort: ['lesson_order:asc', 'id:asc'],
      },
      quizzes: true,
      enrollments: {
        populate: { student: { fields: ['id', 'username', 'email'] } },
      },
    };

    const response = await super.findOne(ctx);
    if (!response || !response.data) {
      return response;
    }

    const course = response.data;
    const courseStatus = course.course_status || 'published';
    const instructorId = course.instructor?.id;

    if (!user || role === 'student') {
      if (courseStatus !== 'published') {
        return ctx.notFound('Course not found');
      }
    } else if (role === 'instructor') {
      if (courseStatus !== 'published' && instructorId !== user.id) {
        return ctx.forbidden('You do not have access to view this course');
      }
    }

    return response;
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to create a course');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students are not permitted to create courses');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    // Convert string description to blocks if provided as text
    if (typeof data.description === 'string') {
      data.description = [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: data.description }],
        },
      ];
    }

    // Role-specific instructor assignment
    if (role === 'instructor') {
      data.instructor = user.id;
    } else if (role === 'admin' || role === 'content_manager') {
      data.instructor = data.instructor || user.id;
    }

    ctx.query.populate = ctx.query.populate || {
      instructor: { fields: ['id', 'username', 'email', 'user_role'] },
      thumbnail: true,
    };

    ctx.request.body = { data };
    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to update a course');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot update courses');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['instructor'],
      });
    } catch {
      existing = await strapi.db.query('api::course.course').findOne({
        where: { id },
        populate: ['instructor'],
      });
    }

    if (!existing) {
      return ctx.notFound('Course not found');
    }

    if (role === 'instructor') {
      const instructorId = existing.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only edit your own courses');
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

    if (role === 'instructor') {
      data.instructor = user.id;
    }

    ctx.query.populate = ctx.query.populate || {
      instructor: { fields: ['id', 'username', 'email', 'user_role'] },
      thumbnail: true,
    };

    ctx.request.body = { data };
    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to delete a course');
    }

    const role = user.user_role;
    if (role === 'student') {
      return ctx.forbidden('Students cannot delete courses');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['instructor'],
      });
    } catch {
      existing = await strapi.db.query('api::course.course').findOne({
        where: { id },
        populate: ['instructor'],
      });
    }

    if (!existing) {
      return ctx.notFound('Course not found');
    }

    if (role === 'instructor') {
      const instructorId = existing.instructor?.id;
      if (instructorId !== user.id) {
        return ctx.forbidden('You can only delete your own courses');
      }
    }

    return await super.delete(ctx);
  },

  async getAdminStats(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view system statistics.');
    }

    const role = user.user_role;
    if (role !== 'admin') {
      return ctx.forbidden('Access denied. Administrator privileges required to access platform statistics.');
    }

    try {
      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        totalContentManagers,
        totalAdmins,
        totalCourses,
        totalEnrollments,
      ] = await Promise.all([
        strapi.db.query('plugin::users-permissions.user').count(),
        strapi.db.query('plugin::users-permissions.user').count({ where: { user_role: 'student' } }),
        strapi.db.query('plugin::users-permissions.user').count({ where: { user_role: 'instructor' } }),
        strapi.db.query('plugin::users-permissions.user').count({ where: { user_role: 'content_manager' } }),
        strapi.db.query('plugin::users-permissions.user').count({ where: { user_role: 'admin' } }),
        strapi.db.query('api::course.course').count(),
        strapi.db.query('api::enrollment.enrollment').count(),
      ]);

      return ctx.send({
        totalUsers,
        totalStudents,
        totalInstructors,
        totalContentManagers,
        totalAdmins,
        totalCourses,
        totalEnrollments,
      });
    } catch (err) {
      strapi.log.error('Error fetching admin statistics:', err?.message);
      return ctx.internalServerError('Failed to load platform statistics.');
    }
  },
}));
