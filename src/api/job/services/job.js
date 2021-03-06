'use strict';

/**
 * job service.
 */

const _ = require('lodash/fp');

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
    
    /**
     * Promise to edit a/an job.
     * @return {Promise}
     */
    async edit(id, data) {
      if (_.isPlainObject(data) === false) {
        console.log('data NO OBJECT');
      }
      return await strapi.query('api::job.job').update({ where: { id }, ...data });
    },

  
    async JobFindOne(filters) {
        const entries = await strapi.entityService.findMany('api::job.job', {
            filters: filters,
        });
        return entries
    }
  }));
