const strapi = require('@strapi/strapi')
const fs = require('fs');

jest.setTimeout(20000);
const setupStrapi = async () => {
  global.strapiInstance = await strapi().load();
  global.strapiInstance.server.mount()
  global.strapiServer = global.strapiInstance.server.app.callback();
}

const teardownStrapi = () => {
  if(global.strapiInstance !== undefined ){
    global.strapiInstance.destroy().then(() => {
      //delete test database after all tests
      const dbSettings = global.strapiInstance.config.get('database.connections.default.settings');
      if (dbSettings && dbSettings.filename) {
        const tmpDbFile = `${__dirname}/../${dbSettings.filename}`;
        if (fs.existsSync(tmpDbFile)) {
          fs.unlinkSync(tmpDbFile);
        }
      }
    })
  }
}


module.exports = {setupStrapi, teardownStrapi}
