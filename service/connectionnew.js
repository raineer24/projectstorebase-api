const BluePromise = require('bluebird');
const config = require('../config/config');
const mysql = require('mysql');

module.exports = BluePromise.promisifyAll(mysql.createPool({
  connectionLimit: 10,
  host: config.db.hostname,
  user: config.db.username,
  password: config.db.password,
  database: config.db.name,
}));
