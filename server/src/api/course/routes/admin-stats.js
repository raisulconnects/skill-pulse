'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/admin/stats',
      handler: 'course.getAdminStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
