/* jslint node: true */
"use strict";

const cloudant = {
  hostname: 'norbsx.cloudant.com',
  username: 'norbsx',
  password: 'grocerxC0nn3ct'
};
const swaggerFile = 'api/swagger/swagger.yaml';
const appEnv = {
  hostname: 'localhost',
  port: 10010
};

module.exports = {
  cloudant: cloudant,
  swaggerFile: swaggerFile,
  appEnv: appEnv
};
