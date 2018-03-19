const BluePromise = require('bluebird');
const _ = require('lodash');
const ConnNew = require('../../service/connectionnew');

const sql = require('sql');

let that;

/**
  * Order constructor
  * @param {object} order
  * @return {object}
*/
function Rating(orderSeller) {
  sql.setDialect('mysql');

  this.model = _.extend(orderSeller, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'rating';
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'starCount',
      'orderkey',
      'useraccount_id',
      'dateCreated',
      'dateUpdated',
    ],
  });
  that = this;
}

/**
  * create
  * @return {object/number}
*/
Rating.prototype.create = () => new BluePromise((resolve, reject) => {
  const query = that.sqlTable.insert(that.model).toQuery();
  that.dbConnNew.queryAsync(query.text, query.values)
    .then((response) => {
      resolve(response.insertId);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Rating.prototype.findById = id => that.getByValue(id, 'id');
Rating.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Rating.prototype.getByValue = (value, field) => {
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
Rating.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = Rating;
