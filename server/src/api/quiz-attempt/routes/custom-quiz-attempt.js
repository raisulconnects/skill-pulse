'use strict';

/**
 * Custom quiz-attempt routes for Quiz Results & Attempt History (Phase 3)
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/quiz-attempts/quiz/:quizId',
      handler: 'quiz-attempt.getQuizAttemptsForQuiz',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
