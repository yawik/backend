module.exports = {
  apps : [{
    name: 'backend',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],

  deploy : {
    production : {
      user : 'yawik',
      host : 'api.yawik.org',
      ref  : 'origin/main',
      repo : 'https://gitlab.com/yawik/backend.git',
      path : '/home/yawik/backend',
      'pre-deploy-local': 'ls -l',
      'post-deploy' : 'yarn && NODE_ENV=production pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'pm2 ps'
    }
  }
};
