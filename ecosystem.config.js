module.exports = {
  apps : [{
    name: 'backend',
    script: 'npm',
    args: 'start'
  }],

  deploy : {
    production : {
      user : 'yawik',
      host : 'api.yawik.org',
      ref  : 'origin/main',
      repo : 'https://gitlab.com/yawik/backend.git',
      path : '/home/yawik/backend',
      'pre-deploy-local': 'ls -l',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'pm2 ps'
    }
  }
};
