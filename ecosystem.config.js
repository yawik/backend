module.exports = {
  apps : [{
    name: 'strapi',
    script: 'yarn',
    args: 'start',
    env: {
      NODE_ENV: "production",
      PORT: 1337
    },
  }],
  
  deploy : {
    production: {
      user : 'yawik',
      host : 'api.yawik.org',
      ref  : 'origin/main',
      repo : 'https://gitlab.com/yawik/backend.git',
      path : '/home/yawik/api.yawik.org',
      'post-deploy' : 'NODE_ENV=production yarn && NODE_ENV=production yarn build && pm2 reload ecosystem.config.js --env production -- --port 3000',
      'pre-setup': 'pm2 ps'
    }
  }
};
