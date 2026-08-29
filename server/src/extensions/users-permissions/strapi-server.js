'use strict';

/**
 * users-permissions Strapi v5 extension.
 *
 * 1. Intercepts the public registration endpoint (POST /api/auth/local/register)
 *    and validates that `user_role` is either "student" or "instructor".
 * 2. Intercepts user endpoints (GET /api/users, PUT /api/users/:id)
 *    and enforces that only Admin users (user_role === 'admin') can access or update roles.
 */
module.exports = (plugin) => {
  // 1. Override Auth Controller Factory for Public Registration Validation
  const originalAuthFactory = plugin.controllers.auth;

  if (originalAuthFactory) {
    plugin.controllers.auth = ({ strapi }) => {
      const original = originalAuthFactory({ strapi });

      return {
        ...original,

        async register(ctx) {
          const { user_role } = ctx.request.body || {};

          const ALLOWED_PUBLIC_ROLES = ['student', 'instructor'];

          if (!user_role) {
            return ctx.badRequest(
              'Registration role is required. Please select either "student" or "instructor".'
            );
          }

          if (!ALLOWED_PUBLIC_ROLES.includes(user_role)) {
            return ctx.badRequest(
              'Invalid registration role. Only "student" and "instructor" roles are allowed for public registration.'
            );
          }

          return original.register(ctx);
        },
      };
    };
  }

  // 2. Override User Controller Methods for Admin User & Role Management
  const userController = plugin.controllers.user;

  if (userController) {
    const originalFind = userController.find;
    const originalFindOne = userController.findOne;
    const originalUpdate = userController.update;

    userController.find = async (ctx) => {
      const user = ctx.state.user;
      if (!user || user.user_role !== 'admin') {
        return ctx.forbidden('Access denied. Administrator privileges required to list platform users.');
      }
      return originalFind(ctx);
    };

    userController.findOne = async (ctx) => {
      const user = ctx.state.user;
      if (!user || user.user_role !== 'admin') {
        return ctx.forbidden('Access denied. Administrator privileges required to view user details.');
      }
      return originalFindOne(ctx);
    };

    userController.update = async (ctx) => {
      const user = ctx.state.user;
      if (!user || user.user_role !== 'admin') {
        return ctx.forbidden('Access denied. Administrator privileges required to update user roles.');
      }

      const ALLOWED_ROLES = ['admin', 'content_manager', 'instructor', 'student'];
      const body = ctx.request.body || {};

      if (body.user_role && !ALLOWED_ROLES.includes(body.user_role)) {
        return ctx.badRequest(
          `Invalid user_role "${body.user_role}". Allowed roles: ${ALLOWED_ROLES.join(', ')}`
        );
      }

      return originalUpdate(ctx);
    };
  }

  return plugin;
};
