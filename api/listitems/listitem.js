const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const ConnNew = require('../../service/connectionnew');

const log = require('color-logs')(true, true, 'Item');

let that;

/**
  * Listitems constructor
  * @param {object} item
  * @return {object}
*/
function ListItems(list) {
  sql.setDialect('mysql');

  this.model = _.extend(list, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'listitem';
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'dateCreated',
      'dateUpdated',
      'item_id',
      'list_id',
    ],
  });

  that = this;
}


/**
  * create
  * @return {object/number}
*/
ListItems.prototype.create = () => new BluePromise((resolve, reject) => {
  that.findAll(0, 1, {
    listId: that.model.list_id,
    itemId: that.model.item_id,
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
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
ListItems.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.listId && filters.itemId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.list_id.equals(filters.listId)
        .and(that.sqlTable.item_id.equals(filters.itemId)))
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
  * removeById
  * @param {string} id
  * @return {object}
*/
ListItems.prototype.removeById = id => new BluePromise((resolve, reject) => {
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        const query = that.sqlTable.delete()
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
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
ListItems.prototype.findById = id => that.getByValue(id, 'id');
ListItems.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
ListItems.prototype.getByValue = (value, field) => {
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
ListItems.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = ListItems;
