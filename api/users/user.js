

const BluePromise = require('bluebird');

const User = {};

/**
  * User authentication of username and password
  * @param {String} username
  * @param {String} password
  * @return {Object}
*/
User.authenticate = (username, password) => new BluePromise((resolve, reject) => {
  if (password !== 'norbert') {
    reject(null);
    return;
  }
  resolve({
    authenticated: true,
    firstName: 'Norbert',
    lastName: 'Dela Pena',
    dateTime: new Date().getTime(),
  });
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
  resolve({
    username: userAuth.username,
    firstName: userAuth.firstName,
    lastName: userAuth.lastName,
    authorize: true,
    roles: [
      'customer',
      'limited',
    ],
    dateAuthenticated: userAuth.dateTime,
    dateAuthorized: new Date().getTime(),
  });
});

module.exports = User;
