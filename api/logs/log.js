const lodash = require('lodash');
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
  return that.dbConnNew.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Log.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = Log;
