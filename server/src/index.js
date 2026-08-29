'use strict';

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      const publicActions = [
        'api::course.course.find',
        'api::course.course.findOne',
      ];

      const authenticatedActions = [
        'api::course.course.find',
        'api::course.course.findOne',
        'api::course.course.create',
        'api::course.course.update',
        'api::course.course.delete',
        'api::enrollment.enrollment.find',
        'api::enrollment.enrollment.findOne',
        'api::enrollment.enrollment.create',
        'api::lesson.lesson.find',
        'api::lesson.lesson.findOne',
        'api::lesson.lesson.create',
        'api::lesson.lesson.update',
        'api::lesson.lesson.delete',
        'api::progress.progress.find',
        'api::progress.progress.findOne',
        'api::progress.progress.create',
        'api::progress.progress.update',
        'api::progress.progress.completeLesson',
        'api::progress.progress.getCourseProgress',
        'plugin::users-permissions.user.find',
        'plugin::users-permissions.user.findOne',
      ];

      // Helper to grant permissions if missing
      const grantPermissions = async (role, actions) => {
        if (!role) return;
        for (const action of actions) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: role.id },
          });
          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: role.id,
              },
            });
          }
        }
      };

      await grantPermissions(publicRole, publicActions);
      await grantPermissions(authenticatedRole, authenticatedActions);
    } catch (err) {
      strapi.log.warn('Could not auto-grant permissions in bootstrap:', err?.message);
    }
  },
};
