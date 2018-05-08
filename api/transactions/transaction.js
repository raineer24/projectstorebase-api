const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Transaction');

const Conn = require('../../service/connection');

let that;


/**
  * generate
  * @return {string}
*/
function generate() {
  return Math.floor((Math.random() * 1000) + 1000) + new Date().getTime() +
    Math.floor((Math.random() * 100) + 100);
}

/**
  * Constructor
  * @param {object} transaction
  * @return {object}
*/
function Transaction(transaction) {
  sql.setDialect('mysql');

  this.model = _.extend(transaction, {
    comments: transaction.comments || '',
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'transaction';
  this.transactionId = generate();
  this.dbConn = Conn;

  this.sqlTable = sql.define({
    name: 'transaction',
    columns: [
      'id',
      'number',
      'comments',
      'action',
      'type',
      'order_id',
      'value',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

/**
  * get transaction number
  * @return {string}
*/
Transaction.prototype.getTransaction = () => that.transactionId;

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Transaction.prototype.findAll = (skip, limit, filters, sortBy, sort) => {
  let query = null;
  let sortString = `${that.table}.dateUpdated DESC`;
  if (sortBy) {
    sortString = `${sortBy === 'date' ? 'dateUpdated' : 'status'} ${sort}`;
  }

  if (filters.useraccountId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.dateFrom && filters.dateTo) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.dateFrom.greaterThanOrEqualTo(filters.dateFrom)
        .and(that.sqlTable.dateTo.lessThanOrEqualTo(filters.dateTo)))
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
  log.info(query.text);

  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * create
  * @return {object/number}
*/
Transaction.prototype.create = () => new BluePromise((resolve, reject) => {
  if (that.model.id) {
    delete that.model.id;
  }
  const query = that.sqlTable.insert(that.model).toQuery();
  that.dbConn.queryAsync(query.text, query.values)
    .then((response) => {
      resolve(that.model.number ? that.model.number : response.insertId);
    })
    .catch((err) => {
      reject(err);
    });
});

Transaction.prototype.grandTotal = () => {
  let query = null;
  query = that.sqlTable
    .select('SUM(VALUE)')
    .from(that.sqlTable)
    .toQuery();
  log.info(query.text);
  return that.dbConn.queryAsync(query.text, query.values);
};

module.exports = Transaction;
