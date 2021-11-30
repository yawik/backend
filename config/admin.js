module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '9981a12f01cef71e4ee131cc243b6955'),
  },
});
