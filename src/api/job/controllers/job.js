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
const uploadFiles = async (strapi, file, refId, field = "html") => {
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
        let { _logo, _header, _org, _orgId } = await createOrgnization(strapi, bodyData.organization, bodyData.jobId, ctx.request.files, bodyData.logo, bodyData.header);
        if (newJob?.data) {
          newJob.data.logo = _logo;
          newJob.data.header = _header;
          newJob.data.org = _orgId;
        }

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
              let job = await createJob(strapi, newUserCreated.id, newJob, ctx.request.files, bodyData.html);
              return job;
            }
          } else {
            console.log('USER found');
            let job = await createJob(strapi, strapiUser.id, newJob, ctx.request.files, bodyData.html);
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
            let job = await createJob(strapi, strapiUser.id, newJob, ctx.request.files, bodyData.html);
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
            if (job?.results && job?.results.length) {
              job = job.results.map( val => {
                delete val?.created_by;
                delete val?.updated_by;
                return val;
              })
            }
            return {
              success: {
                job: job
              }
            }
          }
        } else {
          let job = await strapi.service("api::job.job").find();
          if (job?.results && job?.results.length) {
            job = job.results.map( val => {
              delete val?.created_by;
              delete val?.updated_by;
              return val;
            })
          }
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
            let { _logo, _header, _org, _orgId } = await createOrgnization(strapi, newJob.data.organization, newJob.data.jobId, ctx.request.files, bodyData.logo, bodyData.header);
            if (newJob?.data) {
              newJob.data.logo = _logo;
              newJob.data.header = _header;
              newJob.data.org = _orgId;
            }
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
  if (file && Object.keys(file).length > 0 && file.html && Object.keys(file.html).length > 0) {
    file = file.html;
    _html = await uploadFiles(strapi, file, jobId);
  } else if (html && Object.keys(html).length > 0) {
    file = html;
    _html = await uploadFiles(strapi, file, jobId);
  }
  return _html;
}

/**
 * INFO:Upload orgnization logo file
 * @param {Scope} strapi 
 * @param {File} file 
 * @param {Object} logo 
 * @param {String} jobId 
 * @returns File objects
 */
const logoUpload = async (strapi, file, logo, jobId) => {
  let _logo;
  if (file && Object.keys(file).length > 0 && file.logo && Object.keys(file.logo).length > 0) {
    file = file.logo;
    _logo = await uploadFiles(strapi, file, jobId, 'logo');
  } else if (logo && Object.keys(logo).length > 0) {
    file = logo;
    _logo = await uploadFiles(strapi, file, jobId, 'logo');
  }
  return _logo;
}

/**
 * INFO:Upload orgnization header file
 * @param {Scope} strapi 
 * @param {File} file 
 * @param {Object} header 
 * @param {String} jobId 
 * @returns File objects
 */
const headerUpload = async (strapi, file, header, jobId) => {
  let _header;
  if (file && Object.keys(file).length > 0 && file.header && Object.keys(file.header).length > 0) {
    file = file.header;
    _header = await uploadFiles(strapi, file, jobId, 'header');
  } else if (header && Object.keys(header).length > 0) {
    file = header;
    _header = await uploadFiles(strapi, file, jobId, 'header');
  }
  return _header;
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
const createOrgnization = async (strapi, orgName, JobId, file, logo, header) => {
  let isOrgExist = await strapi.service('api::organization.organization').orgByName({ name: orgName });
  let _logo = await logoUpload(strapi, file, logo, JobId);
  let _header = await headerUpload(strapi, file, header, JobId);
  let _org = {}, _orgId;
  if (!(isOrgExist && isOrgExist.length > 0)) {
    let orgObj = {
      data: {
        name: orgName,
        logo: _logo,
        header: _header,
      }
    }
    _org = await strapi.service('api::organization.organization').addOrg(orgObj);
    if (_org?.success?.organization?.id) {
      _orgId = _org?.success?.organization?.id;
    }
  } else if (isOrgExist && isOrgExist.length && isOrgExist[0].id) {
    _orgId = isOrgExist[0].id;
  }
  return { _logo, _header, _org, _orgId };
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
const createJob = async (strapi, strapiUserId, Jobs, file, html) => {
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
      delete val?.created_by;
      delete val?.updated_by;
      return { id: val.id, attributes: val };
    },job.results),
    meta: {
      pagination: job.pagination,
    }
  }
}