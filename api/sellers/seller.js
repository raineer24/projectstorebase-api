const BluePromise = require('bluebird');
const Conn = require('../../service/connection');
// const Util = require('../helpers/util');
const lodash = require('lodash');

var that;

function Seller(seller) {
  this.model = lodash.extend(seller, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.tableName = 'sellerAccount';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.tableName }));

  that = this;
}

Seller.prototype.create = () => {
  const DbModel = Conn.extend({ tableName: that.tableName });
  that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
  return new BluePromise((resolve, reject) => {
    that.dbConn.saveAsync()
      .then((response) => {
        resolve(response.insertId);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = Seller;
