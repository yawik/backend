'use strict';

/**
 * scrapy router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::scrapy.scrapy');
