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
          applyEmail,
          applyPost,
          applyUrl,
          contactInfo,
          contactInfoLabel,
          formattedAddress,
          intro,
          introLabel,
          jobId,
          jobTitle,
          location,
          offer,
          offerLabel,
          organization,
          profile,
          profileLabel,
          publishedAt,
          reference,
          salary,
          salaryVisibility,
          taskLabel,
          tasks,
          workDuration,
          workKind,
        } = ctx.request.body.data;

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
            applyEmail: applyEmail || '',
            applyPost: applyPost || false,
            applyUrl: applyUrl || '',
            contactInfo: contactInfo || '',
            contactInfoLabel: contactInfoLabel || '',
            formattedAddress: formattedAddress || '',
            intro: intro || '',
            introLabel: introLabel || '',
            jobId: jobId,
            jobTitle: jobTitle || '',
            location: location || {},
            offer: offer || '',
            offerLabel: offerLabel || '',
            organization: organization || '',
            profile: profile || '',
            profileLabel: profileLabel || '',
            reference: reference || '',
            salary: salary || {},
            salaryVisibility: salaryVisibility || true,
            taskLabel: taskLabel || '',
            tasks: tasks || '',
            workDuration: workDuration || [],
            workKind: workKind || [],
          },
        };

        const sub =  userData.data.sub;
        let isUserExist =await strapi.service('api::job-user.job-user').findOneUser({sub: sub});
        
        if (!isUserExist || !(isUserExist.length > 0)) {
          if (userData?.data?.sub) {
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
              let job = await strapi.query("api::job.job").create(newJob);
                
              return {
                success: {
                  job: job
                }
              }            
            }
          } else {
            newJob.data.jobUser = isUserExist.id;
            let job = await strapi.query("api::job.job").create(newJob);
            console.log(job.id, job.uuid)

            return {
              success: {
                job: job
              }
            }
          }
        } else { // title: newJob?.data?.title, jobId: newJob?.data?.title
          let jobId = newJob.data.jobId;
          
          console.log('user found', jobId)
          let isJobExist = await strapi.service("api::job.job").JobFindOne({jobId:jobId});
          console.log(isJobExist);
          if (isJobExist && isJobExist.length > 0) {
            // todo update job
            ctx.request.body.data.id=isJobExist.id;
            console.log(ctx.request.body.data);
            let updateResponse = await strapi.service("api::job.job").update( ctx );
            if (!updateResponse) {
              return {
                error: {
                    status: 5001,
                    name: "update_failed",
                    message: "Job " + jobId + " already Exist",
                },
              };
            } else {
              console.log('Debug OK4');
              return {
                success: {
                  job: job
                }
              }
            }
          } else {
            newJob.data.jobUser = isUserExist[0].id;
            let job = await strapi.query("api::job.job").create(newJob);
            console.log('Debug OK5');
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
