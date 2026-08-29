'use strict';

/**
 * users-permissions Strapi v5 extension.
 *
 * 1. Intercepts the public registration endpoint (POST /api/auth/local/register)
 *    and validates that `user_role` is either "student" or "instructor".
 * 2. Intercepts user endpoints (GET /api/users, PUT /api/users/:id)
 *    with backend pagination, role filtering, searching, and admin-only authorization.
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

  // 2. Override User Controller Methods for Admin User & Role Management with Pagination
  const userController = plugin.controllers.user;

  if (userController) {
    const originalFind = userController.find;
    const originalFindOne = userController.findOne;
    const originalUpdate = userController.update;

    userController.find = async (ctx) => {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be authenticated to access users.');
      }

      const role = user.user_role;
      const query = ctx.query || {};

      // If request is querying for specific dropdown filters (e.g. instructor list for course creation)
      if (query.filters || query['filters[user_role][$eq]']) {
        return originalFind(ctx);
      }

      // Admin-only check for platform user management
      if (role !== 'admin') {
        return ctx.forbidden('Access denied. Administrator privileges required to list platform users.');
      }

      const pageNum = parseInt(query.page || 1, 10) || 1;
      const limitNum = parseInt(query.pageSize || 10, 10) || 10;
      const offsetNum = (pageNum - 1) * limitNum;
      const searchStr = (query.search || '').trim();
      const roleFilter = query.role || 'all';

      // Build database query filters using Strapi v5 operators
      // $containsi = case-insensitive contains (NOT $iLike)
      let where = {};

      if (roleFilter && roleFilter !== 'all' && searchStr !== '') {
        // Both role filter AND search: must match role AND (username or email)
        where = {
          $and: [
            { user_role: { $eq: roleFilter } },
            {
              $or: [
                { username: { $containsi: searchStr } },
                { email: { $containsi: searchStr } },
              ],
            },
          ],
        };
      } else if (roleFilter && roleFilter !== 'all') {
        // Role filter only
        where = { user_role: { $eq: roleFilter } };
      } else if (searchStr !== '') {
        // Search only
        where = {
          $or: [
            { username: { $containsi: searchStr } },
            { email: { $containsi: searchStr } },
          ],
        };
      }

      let total = 0;
      let users = [];

      try {
        // Count total records matching filter
        total = await strapi.db.query('plugin::users-permissions.user').count({ where });

        // Query paginated users
        users = await strapi.db.query('plugin::users-permissions.user').findMany({
          where,
          offset: offsetNum,
          limit: limitNum,
          orderBy: { createdAt: 'desc' },
        });
      } catch (err) {
        strapi.log.error('Error fetching paginated users:', err?.message);
        return ctx.internalServerError('Failed to query users. Check Strapi logs for details.');
      }

      const pageCount = Math.ceil(total / limitNum) || 1;

      return ctx.send({
        data: users,
        meta: {
          pagination: {
            page: pageNum,
            pageSize: limitNum,
            pageCount: pageCount,
            total: total,
          },
        },
      });
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
