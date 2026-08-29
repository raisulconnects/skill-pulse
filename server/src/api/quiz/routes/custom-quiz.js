'use strict';

/**
 * Custom quiz routes for Student Quiz Taking (Phase 2)
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/quizzes/:id/take',
      handler: 'quiz.getQuizForStudent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/quizzes/:id/submit',
      handler: 'quiz.submitQuiz',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
