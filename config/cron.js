const moment = require("moment");
const fs = require("fs");
const path = require('path');

const contentIncludedFrom = (fileName, params) => {
    const filePath = path.join(__dirname , fileName)
    let fileData = fs.readFileSync(filePath, "utf8")
    for (let key in params) {
        const keyReplace = `{{${key}}}`;
        if (fileData.indexOf(keyReplace) > -1) {
            var re = new RegExp(keyReplace, 'g');
            fileData = fileData.replace(re, params[key]);
        }
    }
    return fileData;
}

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
                    username: jobInfo.user.username,
                    link: process.env.APP_URL + jobInfo.locale + "/edit/job/" + jobInfo.id
                }
                await strapi.plugins['email'].services.email.send({
                    to: jobInfo.applyEmail,
                    subject: 'Job Unpublished',
                    text: "",
                    html: contentIncludedFrom("./mails/de/job-was-unpublished.html", params),
                });       
            }
            
        }));

    },
};
