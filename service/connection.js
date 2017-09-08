/* jslint node: true */
"use strict";

var cloudant = require('cloudant');
var config = require('../config/config');

module.exports = cloudant({
  hostname: config.cloudant.host,
  account: config.cloudant.username,
  password: config.cloudant.password
});
