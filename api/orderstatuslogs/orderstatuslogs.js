const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
// const log = require('color-logs')(true, true, 'Order Item');

const Conn = require('../../service/connection');

let that;

/**
  * OrderStatusLogs constructor
  * @param {object} orderStatusLogs
  * @return {object}
*/
function OrderStatusLogs(orderStatusLogs) {
  sql.setDialect('mysql');

  this.model = _.extend(orderStatusLogs, {
    dateCreated: new Date().getTime(),
  });
  this.table = 'orderstatuslogs';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'order_id',
      'handledBy',
      'dateCreated',
      'status',
    ],
  });

  that = this;
}

/**
  * create
  * @return {object/number}
*/
OrderStatusLogs.prototype.create = () => new BluePromise((resolve, reject) => {
  if (that.model.id) {
    delete that.model.id;
  }
  const query = that.sqlTable.insert(that.model).toQuery();
  that.dbConn.queryAsync(query.text, query.values)
    .then((response) => {
      resolve(response.insertId);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderStatusLogs.prototype.findAll = (skip, limit, filters, sortBy, sort) => {
  let query = null;
  let sortString = `${that.table}.dateCreated DESC`;
  if (sortBy) {
    sortString = `${sortBy === 'date' ? 'dateCreated' : 'status'} ${sort}`;
  }
  if (filters.orderId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.order_id.equals(filters.orderId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }

  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
OrderStatusLogs.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = OrderStatusLogs;
