const _ = require('lodash');
const Conn = require('../../service/connection');
const sql = require('sql');

let that;

/**
  * Log constructor
  * @param {object} log
  * @return {object}
*/
function Log(log) {
  sql.setDialect('mysql');

  this.model = _.extend(log, {
    dateCreated: new Date().getTime(),
  });
  this.table = 'log';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'message',
      'action',
      'url',
      'type',
      'orderkey',
      'user_id',
      'selleraccount_id',
      'seller_id',
      'dateCreated',
    ],
  });

  that = this;
}

Log.prototype.create = () => {
  const query = that.sqlTable.insert(that.model).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Log.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Log;
