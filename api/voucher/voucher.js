const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const ConnNew = require('../../service/connectionnew');

const log = require('color-logs')(true, true, 'Item');

let that;

/**
  * List constructor
  * @param {object} item
  * @return {object}
*/
function Voucher(voucher) {
  sql.setDialect('mysql');

  this.model = _.extend(voucher, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'voucher';
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'code',
      'discount',
      'expiryDate',
      'dateCreated',
      'dateUpdated',
      'status',
    ],
  });

  that = this;
}

/**
  * create
  * @return {object/number}
*/
Voucher.prototype.create = () => new BluePromise((resolve, reject) => {
  const query = that.sqlTable.insert(that.modiscountdel).toQuery();
  that.dbConnNew.queryAsync(query.text, query.values)
    .then((response) => {
      resolve(response.insertId);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * update
  * @param {string} id
  * @return {object/number}
*/
Voucher.prototype.update = code => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getByValue(code, 'code')
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not foundssss');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(resultList[0].id)).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.message);
          })
          .catch((err) => {
            reject(err);
          });
      }
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
Voucher.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.something) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
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

  return that.dbConnNew.queryAsync(query.text, query.values);
};

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Voucher.prototype.findById = id => that.getByValue(id, 'id');
Voucher.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Voucher.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConnNew.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Voucher.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = Voucher;
