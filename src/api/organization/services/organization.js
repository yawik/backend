'use strict';

/**
 * organization service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::organization.organization', ({ strapi }) => ({
    /**
     * INFO: Get orgnization by name
     * @param {*} filters 
     * @returns Matched Orgnization
     */
    async orgByName(filters) {
        const entries = await strapi.entityService.findMany('api::organization.organization', {
            filters: filters,
        });
        return entries
    },
    
    /**
     * INFO: Add orgnization
     * @param {*} organization 
     * @returns Added org
     */
    async addOrg(organization) {
        console.log("addOrg:",organization);
        let org = await strapi.query('api::organization.organization').create(organization);
        return {
            success: {
                organization: org
            }
        }
    }
}));
