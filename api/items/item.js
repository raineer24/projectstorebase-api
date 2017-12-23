const BluePromise = require('bluebird');
const lodash = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');
// const Util = require('../helpers/util');

let that;

/**
  * Item constructor
  * @param {object} item
  * @return {object}
*/
function Item(item) {
  this.model = lodash.extend(item, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'item';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Item.prototype.findAll = (skip, limit, filters) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'name', 'category1', 'category2', 'category3'], filters, limit, skip));

/**
  * findByID
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Item.prototype.findById = id => that.dbConn.readAsync(id);

/**
  * create
  * @return {object/number}
*/
Item.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.code, 'code')
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.dbConn.saveAsync()
          .then((response) => {
            resolve(response.insertId);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Get sellerAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Item.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${field} = '${value}'` });

module.exports = Item;
