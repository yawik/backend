'use strict';

/**
 *  scrapy controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::scrapy.scrapy');
