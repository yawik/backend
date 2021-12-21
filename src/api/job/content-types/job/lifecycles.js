module.exports = {

    async afterCreate(data) {
      /**
       * INFO: Service to send transaction template based mail
       * @param {String} subject
       * @param {String} sendTo
       * @param {String} template
       * @param {Array} mergeTags --> Need to send language based on country or region of reciever user
       */
      const _finalRes = await strapi.service('api::email.email')
        .sendMailchimpMail('Job Created', 'bleek@cross-solution.de', 'yawik-default', [{ name: "Language", content: "en" }]);

      console.log("_finalRes in lifecycle =====------=====------>>", _finalRes)
        // await strapi.plugins['email'].services.email.send({
        //     to: 'bleek@cross-solution.de',
        //     subject: 'Job Created',
        //     text: 'Job Created',
        //     html: `<div><div>OK5 New job created: </div><div>ID:${data.result.id} </div></div>`,
        // });
    },
};
