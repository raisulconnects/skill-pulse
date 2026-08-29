'use strict';

/**
 * Custom progress routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/progresses/complete-lesson',
      handler: 'progress.completeLesson',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/progresses/course/:courseId',
      handler: 'progress.getCourseProgress',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
