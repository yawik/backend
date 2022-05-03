'use strict';

/**
 * collector router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::collector.collector');
