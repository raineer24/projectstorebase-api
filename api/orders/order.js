const BluePromise = require('bluebird');
const _ = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');
// const Util = require('../helpers/util');

let that;

/**
  * Category constructor
  * @param {object} category
  * @return {object}
*/
function Order(category) {
  this.model = _.extend(category, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'orderItem';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Order.prototype.findAll = (offset, limit) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'user_id', 'item_id'], null, limit, offset));

/**
  * create
  * @return {object/number}
*/
Order.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.item_id, 'item_id')
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


Order.prototype.update = id => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.model = _.merge(results, that.model);
        that.dbConn.setAsync('id', id);
        that.dbConn.saveAsync()
          .then((response) => {
            resolve(response.message);
          })
          .catch((err) => {
            resolve(err);
          });
      }
    })
    .catch(() => {
      reject('Not Found');
    });
});

Order.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${field} = '${value}'` });

module.exports = Order;
