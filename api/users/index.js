// const BluePromise = require('bluebird');
const User = require('./user');
const query = require('../../service/query');
const user = {};

/**
* User authentication and authorization
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.loginAccount = (req, res) => {
  User.authenticate(req.swagger.params.body.value.username, req.swagger.params.body.value.password)
    .then(userAuth => userAuth)
    .then(User.authorize)
    .then((result) => {
      return res.json(User.cleanResponse(result, { message: 'Found' }));
    })
    .catch((err) => {
      return res.status(404).json({
        message: 'Not found',
      });
    });
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.registerAccount = (req, res) => {
  User.saveAccount(req.swagger.params.body.value.email, req.swagger.params.body.value.password, req.swagger.params.body.value.email, req.swagger.params.body.value.uiid)
    .then((id) => {
      return res.json({
        id: id,
        message: 'Saved',
      });
    })
    .catch((err) => {
      return res.status(err === 'Found' ? 201 : 500).json({
        message: err === 'Found' ? 'Existing' : 'Failed',
      });
    });
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.updateAccount = (req, res) => {
  User.updateAccount(query.validateParam(req.swagger.params, 'id', 0), req.swagger.params.body.value)
    .then((status) => {
      return res.json({
        status: status,
        message: 'Updated',
      });
    })
    .catch((err) => {
      return res.status(err === 'Not Found' ? 404 : 500).json({
        message: err === 'Not Found' ? 'Not found' : 'Failed',
      });
    });
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.viewProfile = (req, res) => {
  User.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then((result) => {
      return res.json(User.cleanResponse(result, { message: 'Found' }));
    })
    .catch((err) => {
      return res.status(404).json({
        message: 'Not found',
      });
    });
};

module.exports = user;
