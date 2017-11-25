const Client = require('mariasql');
const config = require('../config/config');
// const log = require('color-logs')(true, true, __filename);

module.exports = new Client({
  host: config.db.hostname,
  user: config.db.username,
  password: config.db.password,
  db: config.db.name
});
