module.exports = {
    async beforeCreate(data) {
      console.log("data ----------------------->>", data)
    },
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

      if (data && data.result && data.result.jobTitle) {
        _mergeContent.push({ name: "jobTitle", content: data.result.jobTitle })
      }
      if (data && data.result && data.result.organization) {
        _mergeContent.push({ name: "companyname", content: data.result.organization })
      }
      if (data?.params?.data?.html) {
        let _htmlFile = data?.params?.data?.html;
        _htmlFile = _htmlFile && _htmlFile.length && _htmlFile[0].url;
        _mergeContent.push({ name: "link", content: encodeURI("https://api.yawik.org" + _htmlFile) })
      }
//      if (data?.params?.data?.user) {
//        let userId = data?.params?.data?.user;
//        let strapiUser = await strapi.service('plugin::users-permissions.user').fetch({ id: userId });
//        _mergeContent.push({ name: "username", content: strapiUser.username })
//      }

      // there is no link in data set. Let's test with an hardcoded url
      // _mergeContent.push({ name: "link", content: 'https://jobwizard.yawik.org' })
      const _finalRes = await strapi.plugins['email'].services.email.send({
          to: 'bleek@cross-solution.de',
          subject: 'job created',
          text: 'test',
          html: '<p><b>t</b>est</p>'            
        });
        
      // 'Job Created', 'contact@yawik.org', 'de-job-created-check', _mergeContent);

      console.log("_finalRes in lifecycle =====------=====------>>", _finalRes)
        // await strapi.plugins['email'].services.email.send({
        //     to: 'bleek@cross-solution.de',
        //     subject: 'Job Created',
        //     text: 'Job Created',
        //     html: `<div><div>OK5 New job created: </div><div>ID:${data.result.id} </div></div>`,
        // });
    },
};
