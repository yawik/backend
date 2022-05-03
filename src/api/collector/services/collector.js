'use strict';

/**
 * collector service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::collector.collector');
