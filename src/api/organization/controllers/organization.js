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
                message: "Cannot add organization",
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
  async find(ctx) {
    try {
      if (
        ctx.request &&
        ctx.request.header &&
        ctx.request.header.authorization
      ) {  

        ctx.query = { 
          ...ctx.query, 
          filters: {
            user: ctx.state.user.id
          } 
        }

        let org = await getOrganizations(ctx.query);
        
        return org;
      } else {
        console.log('anonymous request');
      }
    } catch (e) {
      console.log("xxx eee =======================", e)
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



/**
 * INFO: Get own oranizations
 * @param {Object} payload 
 * @returns All jobs array
 */
const getOrganizations = async (payload = null) => {
  let org = payload ? await strapi.service("api::organization.organization").find(payload): await strapi.service("api::organization.organization").find();
  return {
    data: org.results.map( val => {
      delete val?.created_by;
      delete val?.updated_by;
      return { id: val.id, attributes: val };
    },org.results),
    meta: {
      pagination: org.pagination,
    }
  }
}
