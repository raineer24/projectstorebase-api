const BluePromise = require('bluebird');
const Conn = require('../../service/connection');
const Util = require('../helpers/util');
// const log = require('color-logs')(true, true, __filename);
const lodash = require('lodash');

const User = {
  tableName: 'userAccount',
};
const userAccountConn = BluePromise.promisifyAll(new Conn({ tableName: User.tableName }));

/**
  * User authentication of username and password
  * @param {string} username
  * @param {string} password
  * @return {object}
*/
User.authenticate = (username, password, uiid) => new BluePromise((resolve, reject) => {
  User.getByUser(username, password, uiid)
    .then((results) => {
      if (results.length === 0) {
        reject('Not found');
        return;
      }

      resolve(lodash.merge({
        authenticated: true,
        token: Util.signToken(results[0].username),
        dateTime: new Date().getTime(),
      }, results[0]));
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Check user entitlement
  * @param {object} userAuth
  * @return {object}
*/
User.authorize = userAuth => new BluePromise((resolve, reject) => {
  if (!userAuth) {
    reject(null);
    return;
  }
  resolve(lodash.merge({
    authorize: true,
    roles: [
      'customer',
      'limited',
    ],
    dateAuthenticated: userAuth.dateTime,
    dateAuthorized: new Date().getTime(),
  }, userAuth));
});

/**
  * Save User account
  * @param {string} username
  * @param {string} password
  * @param {string} email
  * @param {string} uiid
  * @return {object}
*/
User.saveAccount = (username, password, email, uiid) => new BluePromise((resolve, reject) => {
  User.getByValue(username, 'username')
    .then((results) => {
      if (results.length === 0) {
        const UserAccountModel = Conn.extend({
          tableName: User.tableName,
        });
        const userAccount = BluePromise.promisifyAll(new UserAccountModel({
          username,
          password,
          email,
          dateCreated: new Date().getTime(),
          dateUpdated: new Date().getTime(),
          uiid,
        }));
        userAccount.saveAsync()
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

User.updateAccount = (id, record) => new BluePromise((resolve, reject) => {
  User.getById(id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        const UserAccountModel = Conn.extend({
          tableName: User.tableName,
        });
        const userAccount = BluePromise.promisifyAll(new UserAccountModel(record));
        userAccount.setAsync('id', id);
        userAccount.saveAsync()
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

/**
  * Get userAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
User.getByValue = (value, field) => userAccountConn.findAsync('all', { where: `${field} = '${value}'` });

/**
  * Get userAccount by username and password
  * @param {string} username
  * @param {string} password
  * @return {object<Promise>}
*/
User.getByUser = (username, password, uiid) => userAccountConn.findAsync('all', { where: `username = '${username}' AND ${!uiid ? `password = '${password}'` : `uiid = '${uiid}'`}` });

/**
  * Get userAccount by id
  * @param {integer} id
  * @return {object<Promise>}
*/
User.getById = id => userAccountConn.readAsync(id);

/**
  * Format response object and/or append additional object properties
  * @param {object} object
  * @param {object} properties
  * @return {object}
*/
User.cleanResponse = (object, properties) => {
  // eslint-disable-next-line
  delete object.password;
  lodash.merge(object, properties);

  return object;
};


module.exports = User;
