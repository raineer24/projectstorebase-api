const BluePromise = require('bluebird');
const lodash = require('lodash');
const sql = require('sql');
const Conn = require('../../service/connection');
const ConnNew = require('../../service/connectionnew');
const Category = require('../categories/category');

const log = require('color-logs')(true, true, 'Item');

let that;

/**
  * Item constructor
  * @param {object} item
  * @return {object}
*/
function Item(item) {
  sql.setDialect('mysql');

  this.model = lodash.extend(item, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'item';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
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

Item.prototype.getRelatedCategories = results => new BluePromise((resolve, reject) => {
  const list = [];

  results.forEach((obj) => {
    list.push(obj.category1);
  });

  if (list.length === 0) {
    resolve({
      list: results,
      categories: [],
    });
    return;
  }

  new Category({}).findAll(0, 10, {
    categoryList: list,
  })
    .then((catResult) => {
      resolve({
        list: results,
        categories: catResult,
      });
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
Item.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.keyword) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.name.like(`%${filters.keyword}%`))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category2 && filters.category3) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.category2.equals(filters.category2))
      .or(that.sqlTable.category3.equals(filters.category3))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category1) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.category1.equals(filters.category1))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category2) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.category2.equals(filters.category2))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category3) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.category3.equals(filters.category3))
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
Item.prototype.findById = id => that.getByValue(id, 'id');

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
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Item.prototype.getByValue = (value, field) => {
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
Item.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = Item;
