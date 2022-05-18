const {setupStrapi, teardownStrapi} = require('./helpers/strapi')


/** this code is called once before any test is called */
beforeAll(setupStrapi);

/** this code is called once before all the tested are finished */
afterAll(teardownStrapi);

it('strapi instance is defined', () => {
  expect(global.strapiInstance).toBeDefined();
});
