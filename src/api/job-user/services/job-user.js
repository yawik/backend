'use strict';

/**
 * job-user service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job-user.job-user',( { strapi }) =>({
    async findOneUser(filters) {
        const entries = await strapi.entityService.findMany('api::job-user.job-user', {
            filters: filters,
        });
        return entries
    //   return strapi.entityService.findOne('api::job.job', jobId);
    }
}));
