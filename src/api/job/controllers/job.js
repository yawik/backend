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
              status: 4001,
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
          jobTitle,
          tasks,
          location,
          organization,
          intro,
          offer,
          job,
          publishedAt,
        } = ctx.request.body.data;
        
        console.log(ctx.request.body.data);

        if (!jobId) {
          return {
            error: {
              status: 4002,
              name: "no_job_id",
              message: "Request requires a uuid jobId" + jobId,
            },
          };
        }

        let newJob = {
          data: {
            title: title,
            jobTitle: jobTitle || '',
            organization: organization || '',
            location: location || {},
            tasks: tasks || '',
            offer: offer || '',
            intro: intro || '',
            dateCreated: dateCreated || new Date(Date.now()),
            dateModified: dateModified || "2021-12-03T15:50:41.398Z",
            dateDeleted: dateDeleted || "2021-12-03T15:50:41.398Z",
            jobId: jobId,
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
                    status: 4002,
                    name: "user_creation_failed",
                    message: "Could not create User",
                  },
                };
            } else {
              newJob.data.jobUser = newUserCreated.id;
              let jobs = await strapi.query("api::job.job").create(newJob);
              return {
                success: {
                  job: jobs
                }
              }
            }
          } else {
            // todo create job owned by sub
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
          let isJobExist = await strapi.service("api::job.job").JobFindOne({jobId:jobId});
          console.log(isJobExist);
          if (isJobExist && isJobExist.length > 0) {
            // todo update job
            let jobUpdated = await strapi.service("api::job.job").update({jobId:jobId}, newJob );
            if (!jobUpdated) {
              return {
                error: {
                    status: 5001,
                    name: "update_failed",
                    message: "Job " + jobId + " already Exist",
                },
              };
            } else {
              return {
                success: {
                  job: jobs
                }
              }
            }
          } else {
            newJob.data.jobUser = isUserExist[0].id;
            let job = await strapi.query("api::job.job").create(newJob);
            return {
                success: {
                  job: job
                }
            }
          }
        }
        
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
          message: "Internal Server Error",
        },
      };
    }
  },
}));
