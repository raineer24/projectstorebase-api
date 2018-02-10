// const BluePromise = require('bluebird');
const lodash = require('lodash');
// const Conn = require('../../service/connection');
const ConnNew = require('../../service/connectionnew');
const sql = require('sql');

let that;

/**
  * Log constructor
  * @param {object} log
  * @return {object}
*/
function Log(log) {
  sql.setDialect('mysql');

  this.model = lodash.extend(log, {
    dateCreated: new Date().getTime(),
  });
  this.table = 'log';
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: ['id', 'message', 'url', 'type', 'dateCreated'],
  });

  that = this;
}

Log.prototype.create = () => {
  const query = that.sqlTable.insert(that.model).toQuery();
  return that.dbConnNew.queryAsync(query.text, query.values);
};

module.exports = Log;
