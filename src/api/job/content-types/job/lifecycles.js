module.exports = {

    async afterCreate(data) {
        await strapi.plugins['email'].services.email.send({
            to: 'bleek@cross-solution.de',
            subject: 'Job Created',
            text: 'Job Created',
            html: `<div><div>OK5 New job created: </div><div>ID:${data.result.id} </div></div>`,
        });
    },
};