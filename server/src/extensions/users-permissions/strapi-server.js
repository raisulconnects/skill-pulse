'use strict';

/**
 * users-permissions Strapi v5 extension.
 *
 * Intercepts the public registration endpoint (POST /api/auth/local/register)
 * and validates that `user_role` is either "student" or "instructor" before
 * allowing the original Strapi registration logic to run.
 *
 * In Strapi v5, plugin.controllers.auth is a FACTORY function of the form:
 *   ({ strapi }) => ({ register: async (ctx) => { ... }, ... })
 *
 * We must wrap that factory — not the already-instantiated method — so that
 * our validation runs every time the controller is resolved.
 */
module.exports = (plugin) => {
  // Store the original controller factory.
  const originalAuthFactory = plugin.controllers.auth;

  // Replace it with a new factory that wraps the original.
  plugin.controllers.auth = ({ strapi }) => {
    // Instantiate the original controller by calling its factory.
    const original = originalAuthFactory({ strapi });

    return {
      // Spread all original methods (callback, forgotPassword, etc.).
      ...original,

      // Override only the register action.
      async register(ctx) {
        const { user_role } = ctx.request.body || {};

        const ALLOWED_PUBLIC_ROLES = ['student', 'instructor'];

        // Reject missing role.
        if (!user_role) {
          return ctx.badRequest(
            'Registration role is required. Please select either "student" or "instructor".'
          );
        }

        // Reject any role that is not in the public-allowed list.
        if (!ALLOWED_PUBLIC_ROLES.includes(user_role)) {
          return ctx.badRequest(
            'Invalid registration role. Only "student" and "instructor" roles are allowed for public registration.'
          );
        }

        // Role is valid — delegate to the original Strapi registration logic.
        return original.register(ctx);
      },
    };
  };

  return plugin;
};
