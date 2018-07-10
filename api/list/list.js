const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const log = require('color-logs')(true, true, 'List');

const Conn = require('../../service/connection');

let that;

/**
  * List constructor
  * @param {object} item
  * @return {object}
*/
function List(list) {
  sql.setDialect('mysql');

  this.model = _.extend(list, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'list';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'name',
      'description',
      'default',
      'enabled',
      'dateCreated',
      'dateUpdated',
      'useraccount_id',
    ],
  });

  that = this;
}

/**
  * create
  * @return {object/number}
*/
List.prototype.create = () => new BluePromise((resolve, reject) => {
  const query = that.sqlTable.insert(that.model).toQuery();
  that.dbConn.queryAsync(query.text, query.values)
    .then((response) => {
      resolve(response.insertId);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * update
  * @param {string} id
  * @return {object/number}
*/
List.prototype.update = id => new BluePromise((resolve, reject) => {
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
    .catch(() => {
      reject('Not Found');
    });
});


/**
  * removeById
  * @param {string} id
  * @return {object}
*/
List.prototype.removeById = id => new BluePromise((resolve, reject) => {
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        const query = that.sqlTable.delete()
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
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
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
List.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.useraccountId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.useraccount_id.equals(filters.useraccountId))
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

  return that.dbConn.queryAsync(query.text, query.values);
};


/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
List.prototype.findById = id => that.getByValue(id, 'id');
List.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
List.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
List.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = List;
