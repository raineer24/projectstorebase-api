// const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Setting');

const Conn = require('../../service/connection');


let that;

/**
  * Seller constructor
  * @param {object} setting
  * @return {object}
*/

function Setting(setting) {
  sql.setDialect('mysql');

  this.model = _.extend(setting, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'settings';
  this.dbConn = Conn;

  this.sqlTable = sql.define({
    name: 'settings',
    columns: [
      'id',
      'name',
      'value',
      'referrence',
      'dateCreated',
    ],
  });
  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Setting.prototype.findAll = (skip, limit) => {
  let query = null;
  // let sortString = `${that.table}.dateUpdated DESC`;
  // if (sortBy) {
  //   sortString = `${sortBy === 'date' ? 'dateUpdated' : 'status'} ${sort}`;
  // }

  query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .limit(limit)
    .offset(skip)
    .toQuery();

  log.info(query.text);

  return that.dbConn.queryAsync(query.text, query.values);
};


/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Setting.prototype.findById = id => that.getByValue(id, 'id');
Setting.prototype.getById = id => that.getByValue(id, 'id');


/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Setting.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

Setting.cleanResponse = (object, properties) => {
  // eslint-disable-next-line
  delete object.password;
  _.merge(object, properties);

  return object;
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Setting.prototype.release = () => that.dbConn.releaseConnectionAsync();


module.exports = Setting;
