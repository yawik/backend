'use strict';

/**
 * private-upload service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/private-uploads',
        handler: 'private-upload.find',
        config: {
          /**
            Before executing the find action in the Restaurant.js controller,
            we call the global 'is-authenticated' policy,
            found at ./src/policies/is-authenticated.js.
           */
          policies: []
        }
      },
      {
        method: 'POST',
        path: '/private-uploads',
        handler: 'private-upload.create',
        config: {
          /**
            Before executing the find action in the Restaurant.js controller,
            we call the global 'is-authenticated' policy,
            found at ./src/policies/is-authenticated.js.
           */
          policies: []
        }
      },
      {
        method: 'GET',
        path: '/private-uploads/download',
        handler: 'private-upload.download',
        config: {
          /**
            Before executing the find action in the Restaurant.js controller,
            we call the global 'is-authenticated' policy,
            found at ./src/policies/is-authenticated.js.
           */
          policies: []
        }
      }
    ]
  }