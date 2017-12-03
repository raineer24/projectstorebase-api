const BluePromise = require('bluebird');
const Conn = require('../../service/connection');
// const Util = require('../helpers/util');
const lodash = require('lodash');

let that;

/**
  * Seller constructor
  * @param {object} seller
  * @return {object}
*/

function Seller(seller) {
  this.model = lodash.extend(seller, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'sellerAccount';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * Save Seller account
  * @return {object}
*/
Seller.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.username, 'username')
    .then((results) => {
      if (results.length === 0) {
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
  * Update Seller account
  * @return {object}
*/
Seller.prototype.update = () => new BluePromise((resolve, reject) => {
  that.getById(that.model.id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.dbConn.setAsync('id', that.model.id);
        that.dbConn.saveAsync()
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
  * Get sellerAccount by id
  * @param {integer} id
  * @return {object<Promise>}
*/
Seller.prototype.getById = id => that.dbConn.readAsync(id);


/**
  * Get sellerAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Seller.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${field} = '${value}'` });

Seller.cleanResponse = (object, properties) => {
  // eslint-disable-next-line
  delete object.password;
  lodash.merge(object, properties);

  return object;
};


module.exports = Seller;
