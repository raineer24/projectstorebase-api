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
      'account_id',
      'account_type',
      'valid',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

Token.prototype.create = (accountId, accountType) =>
  new BluePromise((resolve, reject) => {
    that.model.key = randomKeyGenerator() + randomKeyGenerator() +
    randomKeyGenerator() + randomKeyGenerator() + randomKeyGenerator();
    log.info(that.model.key);
    const query = that.sqlTable.insert(that.model).toQuery();
    that.dbConn.queryAsync(query.text, query.values)
      .then((response) => {
        if (accountId) {
          const subQuery = that.sqlTableUseraccountToken.insert({
            token_id: response.insertId,
            account_id: accountId,
            account_type: accountType,
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

Token.prototype.invalidate = (accountId, accountType) => new BluePromise((resolve, reject) => {
  const query = that.sqlTableUseraccountToken
    .update({
      valid: '0',
      dateUpdated: new Date().getTime(),
    })
    .where(that.sqlTableUseraccountToken.account_id.equals(accountId)
      .and(that.sqlTableUseraccountToken.account_type.equals(accountType)))
    .toQuery();
  that.dbConn.queryAsync(query.text, query.values)
    .then(() => resolve())
    .catch(err => reject(err));
});

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Token.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.key && filters.type && filters.accountId) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTableUseraccountToken.star(), that.sqlTableUseraccountToken.id.as('userAccountToken_id'))
      .from(that.sqlTable.join(that.sqlTableUseraccountToken)
        .on(that.sqlTableUseraccountToken.token_id.equals(that.sqlTable.id)))
      .where(that.sqlTable.key.equals(filters.key)
        .and(that.sqlTable.type.equals(filters.type))
        .and(that.sqlTableUseraccountToken.account_id.equals(filters.accountId))
        .and(that.sqlTableUseraccountToken.account_type.equals(filters.accountType)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.accountId && filters.tokenId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable.join(that.sqlTableUseraccountToken)
        .on(that.sqlTableUseraccountToken.token_id.equals(that.sqlTable.id)))
      .where(that.sqlTableUseraccountToken.account_id.equals(filters.accountId)
        .and(that.sqlTableUseraccountToken.account_type.equals(filters.accountType))
        .and(that.sqlTableUseraccountToken.token_id.equals(filters.tokenId)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.accountId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable.join(that.sqlTableUseraccountToken)
        .on(that.sqlTableUseraccountToken.token_id.equals(that.sqlTable.id)))
      .where(that.sqlTableUseraccountToken.account_id.equals(filters.accountId)
        .and(that.sqlTableUseraccountToken.account_type.equals(filters.accountType)))
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

Token.prototype.check = (obj, accountType) => new BluePromise((resolve, reject) => {
  log.info('Checking.....');
  that.findAll(0, 1, {
    accountId: obj.accountId,
    accountType,
    key: obj.token,
    type: 'PASSWORD_RESET',
  })
    .then((result) => {
      if (result.length > 0) {
        if (result[0].dateExpiration >= Date.now() && result[0].valid === '1') {
          resolve('Valid');
        } else {
          reject('Invalid');
        }
      } else {
        reject('Not Found');
      }
    })
    .catch((err) => {
      reject(err);
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
