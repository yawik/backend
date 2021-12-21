const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job.job', ({ strapi }) =>({
  /**
   * INFO: Service to send transaction template based mail
   * @param {String} subject
   * @param {String} sendTo
   * @param {String} template
   * @param {Array} mergeTags --> Need to send language based on country or region of reciever user
   */
  async sendMailchimpMail(subject, sendTo, templateName = "yawik-default",  mergeContent = [{ name: "Language", content: "en" }]) {
    const mailchimpClient = require('@mailchimp/mailchimp_transactional')(process.env.MAILCHIMP);
    let messageBody = {
      subject: subject,
      from_email: "contact@yawik.org",
      important: true,
      merge: true,
      merge_language: "handlebars",
      to: [{ email: sendTo, type: "to" }]
    }
    const response = await mailchimpClient.messages.sendTemplate({
      template_name: templateName,
      template_content: mergeContent,
      message: messageBody,
    });
    console.log("MAil sent by mailchimp ====-------====----->> ", response);
  }
}))



