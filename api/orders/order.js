const BluePromise = require('bluebird');
const _ = require('lodash');
const ConnNew = require('../../service/connectionnew');
const config = require('../../config/config');
const Timeslotorder = require('../timeslotorders/timeslotorder');
const Transaction = require('../transactions/transaction');
const sql = require('sql');

// const log = require('color-logs')(true, true, 'Category');

let that;

/**
  * Order constructor
  * @param {object} order
  * @return {object}
*/
function Order(order) {
  sql.setDialect('mysql');

  this.model = _.extend(order, {
    number: 0,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = `${config.db.name}.order`;
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'orderkey',
      'number',
      'itemTotal',
      'total',
      'shipmentTotal',
      'adjustmentTotal',
      'paymentTotal',
      'dateCompleted',
      'shipmentStatus',
      'paymentStatus',
      'status',
      'email',
      'specialInstructions',
      'includedTaxTotal',
      'additionalTaxTotal',
      'displayIncludedTaxTotal',
      'displayAdditionalTaxTotal',
      'taxTotal',
      'currency',
      'totalQuantity',
      'firstname',
      'lastname',
      'phone',
      'billingAddress01',
      'billingAddress02',
      'billCity',
      'billPostalcode',
      'billCountry',
      'billCountry_id',
      'shippingAddress01',
      'shippingAddress02',
      'city',
      'postalcode',
      'country',
      'country_id',
      'paymentMode',
      'paymentInstructions',
      'dateCreated',
      'dateUpdated',
      'userAccount_id',
      'address_id',
    ],
  });

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
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.insertId);
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
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Order.prototype.findById = id => that.getByValue(id, 'id');
Order.prototype.getById = id => that.getByValue(id, 'id');

/**
  * update
  * @return {object/number}
*/
Order.prototype.update = (id, confirmOrder) => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        that.model = _.merge(results, that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(confirmOrder ? id : response.message);
          })
          .catch((err) => {
            reject(err);
          });
      }
    })
    .catch(() => {
      reject('Not found');
    });
});

Order.prototype.updateByOrderkey = orderkey => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getByValue(orderkey, 'orderkey')
    .then((resultList) => {
      if (resultList.length === 0) {
        reject('Not found');
      } else {
        const results = resultList[0];
        that.model = _.merge(results, that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(results.id)).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.message);
          })
          .catch((err) => {
            reject(err);
          });
      }
    })
    .catch(() => {
      reject('Not found');
    });
});

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Order.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConnNew.queryAsync(query.text, query.values);
};


Order.prototype.processOrder = id => new BluePromise((resolve, reject) => {
  that.update(id, true) // update(order_id, confirmOrder)
    .then(new Timeslotorder({ confirmed: 1 }).confirmOrder) // Update timeslotorder
    .then(new Transaction({
      order_id: id,
      action: 'CONFIRM_PAYMENT',
    }).create) // Create transaction
    .then((transactionId) => {
      resolve(transactionId);
    })
    .catch((err) => {
      reject(err);
    });
  // Create notification
});

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Order.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = Order;
