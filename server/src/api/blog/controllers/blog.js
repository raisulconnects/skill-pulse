'use strict';

/**
 * Blog controller with strict role-based access control and draft/published filtering.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blog.blog', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.user_role;

    const query = { ...(ctx.query || {}) };

    // Default populate
    query.populate = query.populate || {
      author: {
        fields: ['id', 'username', 'email', 'user_role'],
      },
      cover_image: true,
    };

    // Default sorting: newest first
    if (!query.sort) {
      query.sort = ['createdAt:desc', 'id:desc'];
    }

    // Role-based visibility enforcement
    // Only Admin and Content Manager can see draft posts
    if (!user || (role !== 'admin' && role !== 'content_manager')) {
      query.filters = {
        ...(query.filters || {}),
        post_status: 'published',
      };
    }

    ctx.query = query;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = user?.user_role;

    ctx.query.populate = ctx.query.populate || {
      author: {
        fields: ['id', 'username', 'email', 'user_role'],
      },
      cover_image: true,
    };

    const response = await super.findOne(ctx);
    if (!response || !response.data) {
      return response;
    }

    const post = response.data;
    const postStatus = post.post_status || 'draft';

    // Draft posts MUST NOT be exposed to students, instructors, or unauthenticated public
    if (!user || (role !== 'admin' && role !== 'content_manager')) {
      if (postStatus !== 'published') {
        return ctx.notFound('Blog post not found');
      }
    }

    return response;
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to create a blog post.');
    }

    const role = user.user_role;
    if (role !== 'admin' && role !== 'content_manager') {
      return ctx.forbidden('Access denied. Only Administrators and Content Managers can create blog posts.');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    // Convert string description to Strapi blocks format if string passed
    if (typeof data.description === 'string') {
      data.description = [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: data.description }],
        },
      ];
    }

    // Auto-bind author to logged in user ID
    data.author = user.id;

    // Set default post_status if not provided
    if (!data.post_status) {
      data.post_status = 'draft';
    }

    ctx.query.populate = ctx.query.populate || {
      author: { fields: ['id', 'username', 'email', 'user_role'] },
      cover_image: true,
    };

    ctx.request.body = { data };
    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to update a blog post.');
    }

    const role = user.user_role;
    if (role !== 'admin' && role !== 'content_manager') {
      return ctx.forbidden('Access denied. Only Administrators and Content Managers can edit blog posts.');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::blog.blog').findOne({
        documentId: id,
        populate: ['author'],
      });
    } catch {
      existing = await strapi.db.query('api::blog.blog').findOne({
        where: { id },
        populate: ['author'],
      });
    }

    if (!existing) {
      return ctx.notFound('Blog post not found.');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;

    // Format text description to blocks if string passed
    if (typeof data.description === 'string') {
      data.description = [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: data.description }],
        },
      ];
    }

    ctx.query.populate = ctx.query.populate || {
      author: { fields: ['id', 'username', 'email', 'user_role'] },
      cover_image: true,
    };

    ctx.request.body = { data };
    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to delete a blog post.');
    }

    const role = user.user_role;
    if (role !== 'admin' && role !== 'content_manager') {
      return ctx.forbidden('Access denied. Only Administrators and Content Managers can delete blog posts.');
    }

    const { id } = ctx.params;
    let existing = null;
    try {
      existing = await strapi.documents('api::blog.blog').findOne({
        documentId: id,
      });
    } catch {
      existing = await strapi.db.query('api::blog.blog').findOne({
        where: { id },
      });
    }

    if (!existing) {
      return ctx.notFound('Blog post not found.');
    }

    return await super.delete(ctx);
  },
}));
