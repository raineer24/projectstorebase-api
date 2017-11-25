const BluePromise = require('bluebird');
const conn = require('../../service/connection');
const Util = require('../helpers/util');
const log = require('color-logs')(true, true, __filename);
const lodash = require('lodash');
const User = {};

/**
  * User authentication of username and password
  * @param {String} username
  * @param {String} password
  * @return {Object}
*/
User.authenticate = (username, password) => new BluePromise((resolve, reject) => {
  User.get(username, password)
    .then((results) => {
      if (parseInt(results.info.numRows, 10) === 0) {
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
  User.get(username, password)
    .then((results) => {
      if (parseInt(results.info.numRows, 10) === 0) {
        var prep = conn.prepare("INSERT INTO userAccount VALUES(0, :username, :password, :email, " + new Date().getTime() + ", :uiid, 0)");
        conn.query(prep({ username: username, password: password, email: email, uiid: uiid }), function(err, rows) {
          if (err) {
            reject(err);
          } else {
            resolve(conn.lastInsertId());
          }
        });
      } else {
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    })
});

User.get = (username, password) => new BluePromise((resolve, reject) => {
  var prep = conn.prepare('SELECT * FROM userAccount WHERE username = :username AND password = :password LIMIT 1');
  conn.query(prep({ username: username, password: password }), function(err, rows) {
    if (err) {
      reject(err);
    }
    else {
      resolve(rows);
    }
  });
  // conn.end();
});

User.getById = (id) => new BluePromise((resolve, reject) => {
  var prep = conn.prepare('SELECT * FROM userAccount WHERE id = :id LIMIT 1');
  conn.query(prep({ id: id }), function(err, rows) {
    if (err) {
      reject(err);
    }
    else {
      if (parseInt(rows.info.numRows, 10) === 0) {
        reject(404);
      }
      else {
        resolve(rows[0]);
      }
    }
  });
});


module.exports = User;
