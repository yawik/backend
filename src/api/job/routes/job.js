'use strict';

/**
 * job router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::job.job',{
    config: {
      description: "create a job posting",      
      find: {
        auth: false
      },
      findOne: {
        auth: false
      },
      create: {
        auth: false
      }
    }
  });
