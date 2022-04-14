'use strict';

/**
 *  application controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::application.application', ({ strapi }) => ({
      async create(ctx) {
        try {
          if (ctx.request && ctx.request.body) {
            console.log(ctx.request.body);
            const Object = ctx.request.body && ctx.request.body.data ? JSON.parse(ctx.request.body.data) : {};
            console.log(Object);

            let application = await strapi.query("api::application.application").create({data: Object});
            return {success: application};
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
            users_permissions_users: ctx.state.user.id
          } 
        }

        let applications = await getApplications(ctx.query);
        
        return applications;
      } else {
        console.log('anonymous request');
      }
    } catch (e) {
      console.log("xyz eee =======================", e)
      return {
        error: {
          status: 5000,
          name: "internal_error",
          message: " " + e,
        },
      };
    }
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    try {
      let application = await strapi.entityService.findOne('api::application.application', id, {
        filters: {
          users_permissions_users: ctx.state.user.id
        },
        populate: { 
          photo: true,
          attachments: true 
        }
      });
      return org
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


//{"job":"76","org":"1",
// "user":{"firstName":"CROSS","lastName":"Solution","street":"","houseNumber":"","postalCode":"60486","city":"Frankfurt am Main","country":"Deutschland",
// "phone":"06971910361","email":"bleek@cross-solution.de","gender":"male"},"summary":"",
// "extras":{"startDate":"02.04.2022","immediate":true,"salary":{"amount":0,"currency":"USD","period":3},"carbonCopy":true,"acceptTerms":true}}


const createApplicationObject = (payload) => {
  let newJob = {
    data: {
      id: payload.id || null,
      job: payload.job || false,
      org: payload.org || false,
      user: payload.user || {},
      summary: payload.summary || '',
      extras: payload.extras || {}
    },
  };
  return newJob;
}

/**
 * INFO: Get own applications
 * @param {Object} payload 
 * @returns All application array
 */
const getApplications = async (payload = null) => {
  
  let applications = payload ? await strapi.service("api::application.application").find(payload): await strapi.service("api::application.application").find();
  return {
    data: applications.results.map( val => {
      delete val?.created_by;
      delete val?.updated_by;
      return { id: val.id, attributes: val };
    },applications.results),
    meta: {
      pagination: applications.pagination,
    }
  }
}
