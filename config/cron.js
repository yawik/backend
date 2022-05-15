const moment = require("moment");
const fs = require("fs");
const path = require('path');

module.exports = {
    '*/10 * * * *': async ({ strapi }) => {
        const publishedJob = await strapi.api.job.services.job.find({
            populate: "*"
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
                const params = {
                    id,
                    jobTitle: jobInfo.jobTitle,
                    firstname: jobInfo.user.firstname || '',
                    lastname: jobInfo.user.lastname || '',
                    link: process.env.APP_URL + jobInfo.locale + "/edit/job/" + jobInfo.id
                }
                const htmlFilePath = path.join(__dirname , "./mails/de/job-was-unpublished.html")
                let txtFilePath = path.join(__dirname , "./mails/de/job-was-unpublished.txt")
                const emailTemplate = {
                    subject: 'Job Unpublished',
                    text: fs.readFileSync(txtFilePath, "utf8"),
                    html: fs.readFileSync(htmlFilePath, "utf8") 
                }
                await strapi.plugins['email'].services.email.sendTemplatedEmail(
                    {
                        to: jobInfo.applyEmail
                    },
                    emailTemplate,
                    {
                        params
                    }
                );  
                
            }   
            
        }));

    },
};