// const accountSid = 'AC504eba691fd6df2f250bd47ed43d5e8'; // Your Account SID from www.twilio.com/console
const accountSid = 'AC504eba691fd6df2f250bd47ed43d5e8c'; // Your Account SID from www.twilio.com/console
const authToken = '65d1ccc8f91026f95ea12c937a2389ce'; // Your Auth Token from www.twilio.com/console

const client = require('twilio')(accountSid, authToken);

 

  module.exports = client;   