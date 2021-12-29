module.exports = {

    async afterCreate(data) {
      /**
       * INFO: Service to send transaction template based mail
       * @param {String} subject
       * @param {String} sendTo
       * @param {String} template
       * @param {Array} mergeTags --> Need to send language based on country or region of reciever user
       */
      const _mergeContent = [
        { name: "Language", content: "en" }
      ]
      
      if (data && data.result)
        console.log("data.result------>>", data.result)     
      if (data && data.result && data.result.jobTitle)
        _mergeContent.push({ name: "jobTitle", content: data.result.jobTitle })
      if (data && data.result && data.result.html)
        _mergeContent.push({ name: "link", content: data.result.html })
        
      // there is no link in data set. Let's test with an hardcoded url  
      _mergeContent.push({ name: "link", content: 'https://jobwizard.yawik.org' })
      const _finalRes = await strapi.service('api::email.email')
        .sendMailchimpMail('Job Created', 'contact@yawik.org', 'yawik-default', _mergeContent);

      console.log("_finalRes in lifecycle =====------=====------>>", _finalRes)
        // await strapi.plugins['email'].services.email.send({
        //     to: 'bleek@cross-solution.de',
        //     subject: 'Job Created',
        //     text: 'Job Created',
        //     html: `<div><div>OK5 New job created: </div><div>ID:${data.result.id} </div></div>`,
        // });
    },
};
