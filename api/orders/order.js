const BluePromise = require('bluebird');
const _ = require('lodash');
const Conn = require('../../service/connection');
// const Query = require('../../service/query');
// const Util = require('../helpers/util');

let that;

/**
  * Category constructor
  * @param {object} category
  * @return {object}
*/
function Order(category) {
  this.model = _.extend(category, {
    number: 0,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.dbName = 'grocerystore';
  this.table = 'grocerystore.order';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * create
  * @return {object/number}
*/
Order.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.orderkey, 'orderkey')
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.dbConn.saveAsync()
          .then(() => {
            resolve(that.model.orderkey);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(that.model.orderkey);
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Get userAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Order.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${that.table}.${field} = '${value}'` });


module.exports = Order;
