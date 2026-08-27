'use strict';

/**
 * quiz-attempt service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::quiz-attempt.quiz-attempt');
