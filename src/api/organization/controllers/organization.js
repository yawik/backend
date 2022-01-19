'use strict';

/**
 *  organization controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::organization.organization', ({ strapi }) => ({
    async create(ctx) {
        try {
          if (ctx.request && ctx.request.body) {
            const org = await strapi.service('api::organization.organization').addOrg(ctx.request.body);
            return org;
          } else {
            return {
              error: {
                status: 4004,
                name: "keycloak_unavailable",
                message: "Cannot access Keycloak",
              },
            };
          }
        } catch (e) {
          console.log(e);
          return {
            error: {
              status: 5000,
              name: "internal_error",
              message: " " + e,
            },
          };
        }
      },
}));
