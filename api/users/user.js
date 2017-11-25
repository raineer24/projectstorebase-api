const BluePromise = require('bluebird');
const conn = require('../../service/connection');
const Util = require('../helpers/util');
const log = require('color-logs')(true, true, __filename);
const lodash = require('lodash');
const User = {
  tableName: 'userAccount'
};
const userAccountConn = BluePromise.promisifyAll(new conn({tableName: User.tableName}));

/**
  * User authentication of username and password
  * @param {String} username
  * @param {String} password
  * @return {Object}
*/
User.authenticate = (username, password) => new BluePromise((resolve, reject) => {
  User.getByUsernamePassword(username, password)
    .then((results) => {
      if (results.length === 0) {
        reject('Not found');
        return;
      }
      delete results[0].password;

      resolve(lodash.merge({
        authenticated: true,
        token: Util.signToken(results[0].username),
        dateTime: new Date().getTime(),
      }, results[0]));
    })
    .catch(err => {
      reject(err);
    })
});

/**
  * Check user entitlement
  * @param {Object} user
  * @return {Object}
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

User.save = (username, password, email, uiid) => new BluePromise((resolve, reject) => {
  User.getByUsernamePassword(username, password)
    .then((results) => {
      if (results.length === 0) {
        var userAccountModel = conn.extend({
          tableName: User.tableName,
        });
        var userAccount = BluePromise.promisifyAll(new userAccountModel({
          username: username,
          password: password,
          email: email,
          dateBirth: 0,
          dateCreated: new Date().getTime(),
          dateUpdated: new Date().getTime(),
          uiid: uiid
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
    })
});

User.getByUsernamePassword = (username, password) => {
  return userAccountConn.findAsync('all', {where: "username = '" + username + "' AND password = '" + password + "'"});
};

User.getById = (id) => {
  return userAccountConn.readAsync(id);
};

User.cleanUp = (user, append) => {
  delete user.password;
  lodash.merge(user, append);

  return user;
};


module.exports = User;
