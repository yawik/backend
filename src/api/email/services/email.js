const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::job.job', ({ strapi }) =>({
  async sendMailchimpMail() {
    const mailchimpClient = require('@mailchimp/mailchimp_transactional')("6V-PSW-LFGs7DVq9HQCreg");
    let messageBody = {
      subject: "Created job",
      from_email: "bleek@cross-solution.de",
      important: true,
      merge: true,
      merge_language: "handlebars",
      to: [{ email: "vishalsim9598@gmail.com", type: "to" }]
    }
    const response = await mailchimpClient.messages.sendTemplate({
      template_name: "yawik-default",
      template_content: [{
          name: "name",
          content: "vishal"
      }],
      message: messageBody,
    });
    console.log(response);
  }
}))



