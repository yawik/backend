module.exports = ({ env }) => ({
  email: {
    provider: 'strapi-provider-email-smtp',
    providerOptions: {
      host: env('EMAIL_SMTP_HOST', 'mc.cross-solution.de'), //SMTP Host
      port: env('EMAIL_SMTP_PORT', 465)   , //SMTP Port
      secure: env('EMAIL_SMTP_SECURE', true),
      username: env('EMAIL_SMTP_USERNAME', ''),
      password: env('EMAIL_SMTP_PASSWORD', ''),
      rejectUnauthorized: true,
      requireTLS: true,
      connectionTimeout: 1,
    },
    settings: {
      from: env('EMAIL_SETTINGS_FROM', '' ),
      replyTo: env('EMAIL_SETTINGS_REPLYTO', '' ),
    },
  },
});