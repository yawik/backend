"use strict";
const axios = require("axios");

/**
 *  job controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::job.job", ({ strapi }) => ({
  async create(ctx) {
    try {
      if (
        ctx.request &&
        ctx.request.header &&
        ctx.request.header.authorization
      ) {
        const userData = await axios({
          method: "GET",
          url: "https://sso.cross-solution.de/auth/realms/YAWIK/protocol/openid-connect/userinfo",
          headers: {
            Authorization: ctx.request.header.authorization,
          },
        });
        if (!userData || userData.data && userData.data.error) {
          return {
            error: {
              status: 0,
              name: "invalid_token",
              message: "Token verification failed",
            },
          };
        }
        const {
          title,
          dateCreated,
          dateModified,
          dateDeleted,
          jobId,
          job,
          publishedAt,
        } = ctx.request.body.data;
        let newJob = {
          data: {
            title: title,
            dateCreated: dateCreated || "2021-12-03T15:50:41.398Z",
            dateModified: dateModified || "2021-12-03T15:50:41.398Z",
            dateDeleted: dateDeleted || "2021-12-03T15:50:41.398Z",
            jobId: jobId || "12",
            job: job || "Bilal",
            publishedAt: publishedAt || "2021-12-03T15:50:41.398Z",
          },
        };
          const sub =  userData.data.sub;
          let isUserExist =await strapi.service('api::job-user.job-user').findOneUser({sub: sub});
          if (!isUserExist || !(isUserExist.length > 0)) {
              if (userData?.data?.sub) {
                  userData.data.publishedAt = newJob.data.publishedAt;
                  let newUserCreated =await strapi.query('api::job-user.job-user').create({ data: userData.data });
                  if (!newUserCreated) {
                    return {
                        error: {
                          status: 0,
                          name: "ERROR",
                          message: "UnAuthorization",
                        },
                      };
                  } else {
                    newJob.data.jobUser = newUserCreated.id;
                    let jobs = await strapi.query("api::job.job").create(newJob);
                    return jobs;
                  }
              } else {
                return {
                    error: {
                      status: 0,
                      name: "UnAuthorization",
                      message: "UnAuthorization",
                    },
                  };    
              }
          } else { // title: newJob?.data?.title, jobId: newJob?.data?.title
              let title = newJob.data.title;
              let jobId = newJob.data.jobId;
              console.log('user  found', title, jobId)
              let isJobExist = await strapi.service("api::job.job").JobFindOne({title:title, jobId:jobId});
              if (isJobExist && isJobExist.length > 0) {
                  return {
                      error: {
                          status: 0,
                          name: "Job Already Exist",
                          message: "Job Already Exist",
                      },
                  };
              } else {
                  newJob.data.jobUser = isUserExist[0].id;
                  let jobs = await strapi.query("api::job.job").create(newJob);
                  return jobs;
              }
          }
        
      } else {
        return {
          error: {
            status: 0,
            name: "UnAuthorization",
            message: "UnAuthorization",
          },
        };
      }
    } catch (e) {
      return {
        error: {
          status: 0,
          name: "UnAuthorization",
          message: "UnAuthorization",
        },
      };
    }
  },
}));
