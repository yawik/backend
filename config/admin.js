module.exports = ({ env }) => ({
  apiToken: {
    salt: env("API_TOKEN_SALT", "rIIBQg4u0EIT9QReWdq0Yw==,VU8GLGr3AW/zL6nOwS1MPg==,7qy5c6wgJ/qaSaiAqw+nxg==,gjg4qeEokJyZfJN8jA38yA=="),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', '9981a12f01cef71e4ee131cc243b6955'),
  },
  watchIgnoreFiles: [
    '**/private/**'
  ],
});
