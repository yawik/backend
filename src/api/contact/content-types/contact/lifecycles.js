// ./src/api/[api-name]/content-types/restaurant/lifecycles.js

module.exports = {
  async beforeCreate(data) {
    console.log("### beforeCreate Hook: data:", data)
  },
  async afterCreate(event) {
    const { result, params } = event;
    
    const _finalRes = await strapi.plugins['email'].services.email.send({
          to: 'bleek@cross-solution.de',
          subject: 'Bewerbung als ... ',
          text: 'test',
          html: '<p>Neue Bewerbungs als <b>....</b></p>' +
                '<p>Kandidate: ' + params.data.firstname + ' ' + params.data.lastname + '</p>' +
                '<p>Telefon: <a href="tel:' + params.data.phone + '">' + params.data.phone + '</a></p>'
        });
        
    console.log("### params: ", params)
    console.log("### afterCreate Hook: data:", _finalRes)

    // do something to the result;
  },
};
