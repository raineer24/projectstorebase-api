const BluePromise = require('bluebird');
const Conn = require('../../service/connection');
const Util = require('../helpers/util');
// const log = require('color-logs')(true, true, __filename);
const lodash = require('lodash');

let that;

function User(user) {
  this.model = lodash.extend(user, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'userAccount';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * User authentication of username and password
  * @param {string} username
  * @param {string} password
  * @return {object}
*/
User.prototype.authenticate = () => new BluePromise((resolve, reject) => {
  that.getByUser(that.model.username, that.model.password, that.model.uiid)
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
User.prototype.authorize = userAuth => new BluePromise((resolve, reject) => {
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
User.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.username, 'username')
    .then((results) => {
      if (that.model.password === undefined) {
        that.model.password = '';
      }
      if (that.model.uiid === undefined) {
        that.model.uiid = '';
      }
      // TODO: Add validation
      if (results.length === 0) {
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

User.prototype.update = id => new BluePromise((resolve, reject) => {
  delete that.model.username;
  if (!that.model.password || !that.model.newPassword) {
    delete that.model.password;
  } else {
    delete that.model.newPassword;
  }
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.model = lodash.merge(results, that.model);
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

/**
  * Get userAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
User.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${field} = '${value}'` });

/**
  * Get userAccount by username and password
  * @param {string} username
  * @param {string} password
  * @return {object<Promise>}
*/
User.prototype.getByUser = (username, password, uiid) => that.dbConn.findAsync('all', { where: `username = '${username}' AND ${!uiid ? `password = '${password}'` : `uiid = '${uiid}'`}` });

/**
  * Get userAccount by id
  * @param {integer} id
  * @return {object<Promise>}
*/
User.prototype.getById = id => that.dbConn.readAsync(id);

/**
  * Format response object and/or append additional object properties
  * @param {object} object
  * @param {object} properties
  * @return {object}
*/
User.prototype.cleanResponse = (object, properties) => {
  // eslint-disable-next-line
  delete object.password;
  lodash.merge(object, properties);

  return object;
};


module.exports = User;
