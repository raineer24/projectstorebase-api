const config = require('../config/config');
// const log = require('color-logs')(true, true, __filename);
const sqlModel = require('mysql-model');

console.log(config.db);

module.exports = sqlModel.createConnection({
  host: config.db.hostname,
  user: config.db.username,
  password: config.db.password,
  database: config.db.name,
});
