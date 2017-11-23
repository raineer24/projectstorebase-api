/* jslint node: true */


const cloudant = require('cloudant');
const config = require('../config/config');

module.exports = cloudant({
  hostname: config.cloudant.host,
  account: config.cloudant.username,
  password: config.cloudant.password,
});
