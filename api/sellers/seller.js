const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Seller');

const Conn = require('../../service/connection');


let that;

/**
  * Seller constructor
  * @param {object} seller
  * @return {object}
*/

function Seller(seller) {
  sql.setDialect('mysql');

  this.model = _.extend(seller, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'seller';
  this.dbConn = Conn;

  this.sqlTable = sql.define({
    name: 'seller',
    columns: [
      'id',
      'name',
      'code',
      'mobileNumber',
      'dateCreated',
      'dateUpdated',
    ],
  });
  that = this;
}

/**
  * Save Seller account
  * @return {object}
*/
Seller.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.code, 'code')
    .then((results) => {
      if (results.length === 0) {
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
      } else {
        resolve(results[0].id);
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Update Seller account
  * @return {object}
*/
Seller.prototype.update = id => new BluePromise((resolve, reject) => {
  delete that.model.username;
  if (!that.model.password || !that.model.newPassword) {
    delete that.model.password;
  } else {
    delete that.model.newPassword;
  }
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
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
Seller.prototype.findAll = (skip, limit, filters, sortBy, sort) => {
  let query = null;
  let sortString = `${that.table}.dateUpdated DESC`;
  if (sortBy) {
    sortString = `${sortBy === 'date' ? 'dateUpdated' : 'status'} ${sort}`;
  }

  query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .order(sortString)
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
Seller.prototype.findById = id => that.getByValue(id, 'id');
Seller.prototype.getById = id => that.getByValue(id, 'id');


/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Seller.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

Seller.cleanResponse = (object, properties) => {
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
Seller.prototype.release = () => that.dbConn.releaseConnectionAsync();


module.exports = Seller;
