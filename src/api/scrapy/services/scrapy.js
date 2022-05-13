'use strict';

/**
 * scrapy service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::scrapy.scrapy');
