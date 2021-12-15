module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'strapi-provider-email-smtp',
      providerOptions: {
        from: env('EMAIL_SETTINGS_FROM', ''),
        host: env('EMAIL_SMTP_HOST', 'mc.cross-solution.de'), //SMTP Host
        port: env('EMAIL_SMTP_PORT', 465), //SMTP Port
        secure: env('EMAIL_SMTP_SECURE', true),
        username: env('EMAIL_SMTP_USERNAME', ''),
        password: env('EMAIL_SMTP_PASSWORD', ''),
        rejectUnauthorized: true,
        replyTo: env('EMAIL_SETTINGS_REPLYTO', ''),
        requireTLS: true,
        connectionTimeout: 1,
      },
    },
  },
});
