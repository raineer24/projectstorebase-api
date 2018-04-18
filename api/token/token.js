const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const log = require('color-logs')(true, true, 'Token');
const randomKeyGenerator = require('random-key-generator');

const Conn = require('../../service/connection');

let that;

function Token(token) {
  sql.setDialect('mysql');

  this.model = _.extend(token, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'token';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'key',
      'type',
      'count',
      'max',
      'enabled',
      'dateExpiration',
      'dateCreated',
      'dateUpdated',
    ],
  });
  this.sqlTableUseraccountToken = sql.define({
    name: 'useraccounttoken',
    columns: [
      'id',
      'token_id',
      'useraccount_id',
      'valid',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

Token.prototype.create = useraccountId => new BluePromise((resolve, reject) => {
  that.model.key = randomKeyGenerator() + randomKeyGenerator() +
  randomKeyGenerator() + randomKeyGenerator() + randomKeyGenerator();
  log.info(that.model.key);
  const query = that.sqlTable.insert(that.model).toQuery();
  that.dbConn.queryAsync(query.text, query.values)
    .then((response) => {
      if (useraccountId) {
        const subQuery = that.sqlTableUseraccountToken.insert({
          token_id: response.insertId,
          useraccount_id: useraccountId,
          valid: 1,
          dateCreated: new Date().getTime(),
          dateUpdated: new Date().getTime(),
        }).toQuery();
        that.dbConn.queryAsync(subQuery.text, subQuery.values)
          .then(() => {
            resolve(response.insertId);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(response.insertId);
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
Token.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.key && filters.type && filters.useraccountId) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTableUseraccountToken.star(), that.sqlTableUseraccountToken.id.as('userAccountToken_id'))
      .from(that.sqlTable.join(that.sqlTableUseraccountToken)
        .on(that.sqlTableUseraccountToken.token_id.equals(that.sqlTable.id)))
      .where(that.sqlTable.key.equals(filters.key)
        .and(that.sqlTable.type.equals(filters.type))
        .and(that.sqlTableUseraccountToken.useraccount_id.equals(filters.useraccountId)))
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
Token.prototype.findById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Token.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

Token.prototype.check = obj => new BluePromise((resolve, reject) => {
  log.info('Checking.....');
  that.findAll(0, 1, {
    useraccountId: obj.useraccount_id,
    key: obj.token,
    type: obj.type
  })
    .then((result) => {
      log.info(result);
      if (result.length > 0) {
        // const query = that.sqlTable.insert(that.model).toQuery();
        // that.dbConn.queryAsync(query.text, query.values)
        //   .then((response) => {
        //     resolve(response.insertId);
        //   })
        //   .catch((err) => {
        //     reject(err);
        //   });
        resolve(result);
      } else {
        reject(403);
      }
    })
    .catch((err) => {
      log.error('Not found', err);
      reject(403);
    });
});

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Token.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Token;
