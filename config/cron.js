const moment = require("moment");

module.exports = {
    '*/10 * * * *': async ({ strapi }) => {
        const publishedJob = await strapi.api.job.services.job.find({
        });

        await Promise.all(publishedJob.results.map(async (jobInfo) => {
            const id = jobInfo.id;
            if (moment.utc().diff(moment(jobInfo.publishedAt).utc(), "days") > jobInfo.meta.publishDays) {
                console.log("CRON unpublish:", jobInfo.id);
                await strapi.api.job.services.job.update(id,
                    {
                        data: {
                            status: 'unpublished',
                            publishedAt: null
                        }
                });
                await strapi.plugins['email'].services.email.send({
                    to: jobInfo.applyEmail,
                    subject: 'Job Unpublished',
                    text: 'Job Unpublished',
                    html: `<div><div>Your Job Unpublished: </div><div>ID:${id} </div></div>`,
                });
            }
        }));

    },
};
