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
                    text: contentIncludedFrom("./message.txt", {id}),
                    html: contentIncludedFrom("./message.html", {id}),
                });   
            }
        }));

    },
};
