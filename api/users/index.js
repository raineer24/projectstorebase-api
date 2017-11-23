

// const BluePromise = require('bluebird');
const User = require('./user');

const user = {};

/**
* User authentication and authorization
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.login = (req, res) => {
  User.authenticate(req.swagger.params.body.value.username, req.swagger.params.body.value.password)
    .then(userAuth => userAuth)
    .then(User.authorize)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.status(403).json({
        message: 'Not found',
      });
    });
};

module.exports = user;
