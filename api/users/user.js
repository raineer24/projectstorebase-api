'use strict';

const BluePromise = require('bluebird');
let User = {};

/**
  * User authentication of username and password
  * @param {String} username
  * @param {String} password
  * @return {Object}
*/
User.authenticate = (username, password) => {
  return new BluePromise((resolve, reject) => {
    if (false) {
      reject(null);
      return;
    }
    resolve({
      authenticated: true,
      firstName: 'Norbert',
      lastName: 'Dela Pena',
      dateTime: new Date().getTime()
    });
  });
};

/**
  * Check user entitlement
  * @param {Object} user
  * @return {Object}
*/
User.authorize = (userAuth) => {
  return new BluePromise((resolve, reject) => {
    if (false) {
      reject(null);
      return;
    }
    resolve({
      username: userAuth.username,
      firstName: userAuth.firstName,
      lastName: userAuth.lastName,
      authorize: true,
      roles: [
        'customer',
        'limited'
      ],
      dateAuthenticated: userAuth.dateTime,
      dateAuthorized: new Date().getTime()
    });
  });
};

module.exports = User;
