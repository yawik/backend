'use strict';

/**
 * job service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job.job', ({ strapi }) =>  ({
    // Method 1: Creating an entirely custom service
    async exampleService(...args) {
      let response = { okay: true }
  
      if (response.okay === false) {
        return { response, error: true }
      }
  
      return response
    },
  
    // Method 2: Wrapping a core service (leaves core logic in place)
    
    // Method 3: Replacing a core service
    async JobFindOne(filters) {
        const entries = await strapi.entityService.findMany('api::job.job', {
            filters: filters,
        });
        return entries
    //   return strapi.entityService.findOne('api::job.job', jobId);
    }
  }));
