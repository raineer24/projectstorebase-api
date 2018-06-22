const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const log = require('color-logs')(true, true, 'Timeslot');

const Conn = require('../../service/connection');

let that;

/**
  * Constructor
  * @param {object} timeslotOrder
  * @return {object}timeslot
*/
function Timeslot(timeslot) {
  sql.setDialect('mysql');

  this.model = _.extend(timeslot, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'timeslot';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'range',
      'd1max',
      'd2max',
      'd3max',
      'd4max',
      'd5max',
      'd6max',
      'd7max',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Timeslot.prototype.findById = id => that.getByValue(id, 'id');
Timeslot.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Timeslot.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};


/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Timeslot.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.timeslotId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.timeslot_id.equals(filters.timeslotId))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }
  log.info(query.text);

  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * updateAllTimeSlots
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Timeslot.prototype.updateAllTimeSlots = data => new BluePromise((resolve, reject) => {
  let d1max = '';
  let d2max = '';
  let d3max = '';
  let d4max = '';
  let d5max = '';
  let d6max = '';
  let d7max = '';
  const ids = [];
  _.forEach(data, (obj) => {
    d1max += `WHEN id = ${obj.id} THEN '${obj.d1max}' `;
    d2max += `WHEN id = ${obj.id} THEN '${obj.d2max}' `;
    d3max += `WHEN id = ${obj.id} THEN '${obj.d3max}' `;
    d4max += `WHEN id = ${obj.id} THEN '${obj.d4max}' `;
    d5max += `WHEN id = ${obj.id} THEN '${obj.d5max}' `;
    d6max += `WHEN id = ${obj.id} THEN '${obj.d6max}' `;
    d7max += `WHEN id = ${obj.id} THEN '${obj.d7max}' `;
    ids.push(obj.id);
  });
  const strSql = `
  UPDATE timeslot
  SET d1max = CASE ${d1max} END,
      d2max = CASE ${d2max} END,
      d3max = CASE ${d3max} END,
      d4max = CASE ${d4max} END,
      d5max = CASE ${d5max} END,
      d6max = CASE ${d6max} END,
      d7max = CASE ${d7max} END,
      dateUpdated = '${new Date().getTime()}'
  WHERE id IN (${ids.join(',')})`;
  log.info(strSql);
  that.dbConn.queryAsync(strSql)
    .then((response) => {
      log.info(response.message);
      resolve(response.message);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Timeslot.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Timeslot;
