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
  User.authenticate(
    req.swagger.params.body.value.username,
    req.swagger.params.body.value.password,
    req.swagger.params.body.value.uiid,
  )
    .then(userAuth => userAuth)
    .then(User.authorize)
    .then(result => res.json(User.cleanResponse(result, { message: 'Found' })))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.registerAccount = (req, res) => {
  User.saveAccount(
    req.swagger.params.body.value.email,
    req.swagger.params.body.value.password,
    req.swagger.params.body.value.email,
    req.swagger.params.body.value.uiid,
  )
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : 'Failed',
    }));
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.updateAccount = (req, res) => {
  User.updateAccount(query.validateParam(req.swagger.params, 'id', 0), req.swagger.params.body.value)
    .then(status => res.json({ status, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : 'Failed',
    }));
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.viewAccount = (req, res) => {
  User.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(User.cleanResponse(result, { message: 'Found' })))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

module.exports = user;
