'use strict';

/**
 * application service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::application.application', ({ strapi }) => ({
    /**
     * INFO: Add application
     * @param {*} organization 
     * @returns Added org
     */
    async addApplication(application) {
        console.log("addApplication:",application);
        let data = await strapi.query('api::application.application').create(application);
        return {
            success: {
                application: data
            }
        }
    }
}));