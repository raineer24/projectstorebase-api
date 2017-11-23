'use strict';

const BluePromise = require('bluebird');
const User = require('./user');
let user = {};

/**
* User authentication and authorization
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.login = (req, res) => {
  let username = req.swagger.params.body.value.username;
  let password =  req.swagger.params.body.value.password;

  User.authenticate(username, password)
    .then((userAuth) => {
      return userAuth;
    })
    .then(User.authorize)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.status(403).json({
        message: 'Not found'
      });
    });
};

module.exports = user;
