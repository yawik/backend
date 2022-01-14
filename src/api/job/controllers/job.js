"use strict";
const axios = require("axios");
const fs = require("fs");
const authUrl = "https://sso.cross-solution.de/auth/realms/YAWIK/protocol/openid-connect/userinfo";

/**
 *  job controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

/**
 * INFO: Upload html file to locally for job
 * @param {*} strapi
 * @param {Object} file
 * @param {String} refId
 * @param {String} field // such as html, logo default for html
 * @returns File reference object
 */
const uploadHtml = async (strapi, file, refId, field = "html") => {
  const fileStat = fs.statSync(file.path);
  const _upload = await strapi.plugins.upload.services.upload.upload({
    data: {
      refId: refId,
      ref: "job",
      field: field,
    },
    files: {
      path: file.path,
      name: file.name,
      type: file.type,
      size: fileStat.size,
    },
  });
  console.log("_upload ====--------=====------>> ", _upload)
  return _upload;
}


module.exports = createCoreController("api::job.job", ({ strapi }) => ({
  async create(ctx) {
    try {
      if (
        ctx.request &&
        ctx.request.header &&
        ctx.request.header.authorization
      ) {
        const userData = await authUser(ctx.request.header.authorization);
        if (userData && userData.error) return userData;
        const bodyData = ctx.request.body && ctx.request.body.data ? JSON.parse(ctx.request.body.data) : {};
        console.log(bodyData);
        const newJob = createJobObject(bodyData);
        if (!newJob?.data?.jobId) {
          return {
            error: {
              status: 4002,
              name: "no_job_id",
              message: "Request requires a uuid jobId " + jobId,
            },
          };
        }
        const sub =  userData.data.sub;
        let strapiUser = await strapi.service('plugin::users-permissions.user').fetch({sub: sub});
        console.log('UserData: ', userData.data, strapiUser);

        if (!strapiUser) {
          console.log('Create User');
          if (userData?.data?.sub) {
            let newUserCreated = await strapi.service('plugin::users-permissions.user').add(
            {
              sub: sub,
              email: userData.data.email,
              username: userData.data.name
            });
            if (!newUserCreated) {
              return {
                error: {
                  status: 4002,
                  name: "user_creation_failed",
                  message: "Could not create User",
                },
              };
            } else {
              let job = await createUser(strapi, newUserCreated.id, newJob, ctx.request.files, bodyData.html);
              return job;
            }
          } else {
            console.log('USER found');
            let job = await createUser(strapi, strapiUser.id, newJob, ctx.request.files, bodyData.html);
            return job;
          }
        } else { // title: newJob?.data?.title, jobId: newJob?.data?.title
          let jobId = newJob.data.jobId;

          console.log('user found', jobId)
          let isJobExist = await strapi.service("api::job.job").JobFindOne({jobId:jobId});
          console.log("Job found !!!!!!", isJobExist);
          if (isJobExist && isJobExist.length > 0) {
            // todo update job
            let data = ctx.request.body.data;
            console.log("CTX", data );
            let _html = await htmlUpload(strapi, ctx.request.files, bodyData.html, jobId);
            newJob.data.html = _html;
            let updateResponse = await strapi.service("api::job.job").edit({ id: isJobExist[0].id }, { jobTitle: data?.jobTitle });
            if (!updateResponse) {
              return {
                error: {
                    status: 5001,
                    name: "update_failed",
                    message: "Job " + jobId + " already Exist!",
                },
              };
            } else {
              console.log('Debug OK4');
              return {
                success: {
                  job: updateResponse
                }
              }
            }
          } else {
            console.log('Debug OK5', strapiUser);
            let job = await createUser(strapi, strapiUser.id, newJob, ctx.request.files, bodyData.html);
            console.log('Debug OK5');
            return job;
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
        const userData = await authUser(ctx.request.header.authorization);
        if (userData?.data?.sub) {
          let strapiUser = await strapi.service('plugin::users-permissions.user').fetch({sub: userData.data.sub});
          console.log('authenticated user', strapiUser.id);
          if (strapiUser && strapiUser.id) {
            ctx.query = { 
              ...ctx.query, 
              publicationState: 'preview',
              filters: {
                user: strapiUser.id
              } 
            }
            console.log('authenticated user', strapiUser.id, ctx.query);
            let job = await getJobs(ctx.query);
            return job;
          } else {
            let job = await getJobs(ctx.query);
            return job;
          }
        } else {
          let job = await getJobs(ctx.query);
          return job;
        }
      } else {
        let job = await getJobs(ctx.query);
        return job;
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
  async findOne(ctx) {
    const { id } = ctx.params;
    try {
      if (
        ctx.request &&
        ctx.request.header &&
        ctx.request.header.authorization
      ) {
        console.log("START findOne", ctx);
        const userData = await authUser(ctx.request.header.authorization);
        if (userData?.data?.sub) {
          let strapiUser = await strapi.service('plugin::users-permissions.user').fetch({sub: userData.data.sub});
          if (strapiUser && strapiUser.id) {
            ctx.query = { 
              ...ctx.query, 
              filters: {
                user: strapiUser.id
              }
            }
            console.log(ctx);
            let job = await strapi.service("api::job.job").findOne(id, ctx.query);
            return {
              success: {
                job: job
              }
            }
          } else {
            let job = await strapi.service("api::job.job").find();
            return {
              success: {
                job: job
              }
            }
          }
        } else {
          let job = await strapi.service("api::job.job").find();
          return {
            success: {
              job: job
            }
          }
        }
      } else {
        let job = await getJobs(ctx.query);
        return job;
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
  async update(ctx) {
    const { id } = ctx.params;
    try {
      if (
        ctx.request &&
        ctx.request.header &&
        ctx.request.header.authorization
      ) {
        console.log("START update", ctx);
        const userData = await authUser(ctx.request.header.authorization);
        if (userData && userData.error) return userData;
        const bodyData = ctx.request.body && ctx.request.body.data ? JSON.parse(ctx.request.body.data) : {};
        const newJob = createJobObject(bodyData);
        if (!newJob?.data?.jobId) {
          return {
            error: {
              status: 4002,
              name: "no_job_id",
              message: "Request requires a uuid jobId " + jobId,
            },
          };
        }

        if (userData?.data?.sub) {
          let strapiUser = await strapi.service('plugin::users-permissions.user').fetch({sub: userData.data.sub});
          if (strapiUser && strapiUser.id) {
            ctx.query = { 
              ...ctx.query, 
              filters: {
                user: strapiUser.id
              }
            }
            let _html = await htmlUpload(strapi, ctx.request.files, bodyData.html, newJob.data.jobId);
            newJob.data.user = strapiUser.id;
            newJob.data.html = _html;
            let job = await strapi.service("api::job.job").update(id, newJob);
            return {
              success: {
                job: job
              }
            }
          } else {
            return {
              error: {
                status: 4002,
                name: "no_job_id",
                message: "Request requires a uuid jobId " + jobId,
              },
            };
          }
        } else {
          return {
            error: {
              status: 4002,
              name: "no_job_id",
              message: "Request requires a uuid jobId " + jobId,
            },
          };
        }
      } else {
        let job = await getJobs(ctx.query);
        return job;
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
  async delete(ctx) {
    const { id } = ctx.params;
    try {
      if (
        ctx.request &&
        ctx.request.header &&
        ctx.request.header.authorization
      ) {
        console.log("START delete", ctx);
        const userData = await authUser(ctx.request.header.authorization);
        if (userData && userData.error) return userData;
        if (userData?.data?.sub) {
          let strapiUser = await strapi.service('plugin::users-permissions.user').fetch({sub: userData.data.sub});
          if (strapiUser && strapiUser.id) {
            ctx.query = { 
              ...ctx.query, 
              filters: {
                user: strapiUser.id
              }
            }
            
            let job = await strapi.service("api::job.job").delete(id, ctx.query);
            return {
              success: {
                job: job
              }
            }
          } else {
            return {
              error: {
                status: 4002,
                name: "no_job_id",
                message: "Request requires a uuid jobId " + jobId,
              },
            };
          }
        } else {
          return {
            error: {
              status: 4002,
              name: "no_job_id",
              message: "Request requires a uuid jobId " + jobId,
            },
          };
        }
      } else {
        let job = await getJobs(ctx.query);
        return job;
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

// ================= HELPER FUNCTIONS FOR JOBS AD ===========

/**
 * INFO: Prepare data to create job
 * @param {Object} payload 
 * @returns Jobs object
 */
const createJobObject = (payload) => {
  let newJob = {
    data: {
      applyEmail: payload.applyEmail || '',
      applyPost: payload.applyPost || false,
      applyUrl: payload.applyUrl || '',
      contactInfo: payload.contactInfo || '',
      contactInfoLabel: payload.contactInfoLabel || '',
      formattedAddress: payload.formattedAddress || '',
      intro: payload.intro || '',
      introLabel: payload.introLabel || '',
      jobId: payload.jobId,
      jobTitle: payload.jobTitle || '',
      location: payload.location || {},
      meta: payload.meta || {},
      offer: payload.offer || '',
      offerLabel: payload.offerLabel || '',
      organization: payload.organization || '',
      profile: payload.profile || '',
      profileLabel: payload.profileLabel || '',
      reference: payload.reference || '',
      salary: payload.salary || {},
      salaryVisibility: payload.salaryVisibility || true,
      taskLabel: payload.taskLabel || '',
      tasks: payload.tasks || '',
      workDuration: payload.workDuration || [],
      workKind: payload.workKind || []
    },
  };
  return newJob;
}

/**
 * INFO: Authenticate user from token
 * @param {Token} authorization 
 * @returns authenticated user
 */
const authUser = async (authorization) => {
  const userData = await axios({
    method: "GET",
    url: process.env.AUTH_URL ? process.env.AUTH_URL : authUrl,
    headers: {
      Authorization: authorization,
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
  } else {
    return userData
  }
}

/**
 * INFO:Upload job ad file
 * @param {Scope} strapi 
 * @param {File} file 
 * @param {Object} html 
 * @param {String} jobId 
 * @returns File objects
 */
const htmlUpload = async (strapi, file, html, jobId) => {
  let _html;
  if (file && Object.keys(file).length > 0 && Object.keys(file.html).length > 0) {
    file = file.html;
    _html = await uploadHtml(strapi, file, jobId);
  } else if (html && Object.keys(html).length > 0) {
    file = html;
    _html = await uploadHtml(strapi, file, jobId);
  }
  return _html;
}

/**
 * INFO: Create job
 * @param {Scope} strapi 
 * @param {String} strapiUserId 
 * @param {Object} Jobs 
 * @param {Files} file 
 * @param {Object} html 
 * @returns Job success
 */
const createUser = async (strapi, strapiUserId, Jobs, file, html) => {
  let _html = await htmlUpload(strapi, file, html, Jobs.data.jobId);
  Jobs.data.user = strapiUserId;
  Jobs.data.html = _html;
  let job = await strapi.query("api::job.job").create(Jobs);
  return {
    success: {
      job: job
    }
  }
}

/**
 * INFO: Get all jobs
 * @param {Object} payload 
 * @returns All jobs array
 */
const getJobs = async (payload = null) => {
  let job = payload ? await strapi.service("api::job.job").find(payload): await strapi.service("api::job.job").find();
  return {
    data: job.results.map( val => {
      return { id: val.id, attributes: val };
    },job.results),
    meta: {
      pagination: job.pagination,
    }
  }
}