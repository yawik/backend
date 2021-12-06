module.exports = {
  apps : [{
    name: 'backend',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: "development",
      PORT: 1337,
    },
    env_staging: {
      NODE_ENV: "staging",
      PORT: 4000,

    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,

    }
  }],

  deploy : {
    production : {
      user : 'yawik',
      host : 'api.yawik.org',
      ref  : 'origin/main',
      repo : 'https://gitlab.com/yawik/backend.git',
      path : '/home/yawik/production',
      'pre-deploy-local': 'ls -l',
      'post-deploy' : 'yarn && NODE_ENV=production pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'pm2 ps'
    },
    staging : {
      user : 'yawik',
      host : 'api.yawik.org',
      ref  : 'origin/staging',
      repo : 'https://gitlab.com/yawik/backend.git',
      path : '/home/yawik/staging',
      'pre-deploy-local': 'echo STAGING',
      'post-deploy' : 'yarn && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': 'pm2 ps'
    }
  }
};
