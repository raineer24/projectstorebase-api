const BluePromise = require('bluebird');
const _ = require('lodash');
const ConnNew = require('../../service/connectionnew');
const sql = require('sql');

const log = require('color-logs')(true, true, 'Category');

let that;

/**
  * OrderItem constructor
  * @param {object} orderItem
  * @return {object}
*/
function OrderItem(orderItem) {
  sql.setDialect('mysql');

  this.model = _.extend(orderItem, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'orderitem';
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'enabled',
      'dateCreated',
      'dateUpdated',
      'orderkey',
      'user_id',
      'item_id',
      'order_id',
      'quantity',
      'processed',
    ],
  });
  this.sqlTableItem = sql.define({
    name: 'item',
    columns: [
      'id',
      'code',
      'name',
      'brandName',
      'price',
      'displayPrice',
      'hasVat',
      'isSenior',
      'weighted',
      'packaging',
      'packageMeasurement',
      'sizing',
      'pacakgeMinimum',
      'packageIntervals',
      'availableOn',
      'slug',
      'imageKey',
      'enabled',
      'category1',
      'category2',
      'category3',
      'sellerAccount_id',
      'dateCreated',
      'dateUpdated',
    ],
  });
  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderItem.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.itemId && filters.orderkey) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.item_id.equals(filters.itemId)
        .and(that.sqlTable.orderkey.equals(filters.orderkey)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.orderkey) {
    query = that.sqlTable
      .select(that.sqlTable.id.as('orderItem_id'), that.sqlTable.star(), that.sqlTableItem.star())
      .from(that.sqlTable.join(that.sqlTableItem)
        .on(that.sqlTable.item_id.equals(that.sqlTableItem.id)))
      .where(that.sqlTable.orderkey.equals(filters.orderkey))
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
  * create
  * @return {object/number}
*/
OrderItem.prototype.create = () => new BluePromise((resolve, reject) => {
  that.findAll(0, 1, {
    itemId: that.model.item_id,
    orderkey: that.model.orderkey,
  })
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
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * update
  * @return {object/number}
*/
OrderItem.prototype.update = orderItemId => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getById(orderItemId)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not found');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(orderItemId)).toQuery();
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
OrderItem.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConnNew.queryAsync(query.text, query.values);
};

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderItem.prototype.findById = id => that.getByValue(id, 'id');
OrderItem.prototype.getById = id => that.getByValue(id, 'id');

/**
  * removeById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderItem.prototype.removeById = id => new BluePromise((resolve, reject) => {
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        const query = that.sqlTable.delete(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
          .then(() => {
            resolve('Deleted');
          })
          .catch((err) => {
            reject(err);
          });
      }
    })
    .catch(() => {
      reject('Not Found');
    });
});

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
OrderItem.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = OrderItem;
