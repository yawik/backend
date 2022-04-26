const cronTasks = require("./cron");

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
  url: env('STRAPI_PUBLIC_URL', 'https://api.yawik.org')
});
