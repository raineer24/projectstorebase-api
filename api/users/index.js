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
  const objUser = new User(req.swagger.params.body.value);
  objUser.authenticate()
    .then(userAuth => userAuth)
    .then(objUser.authorize)
    .then(result => res.json(objUser.cleanResponse(result, { message: 'Found' })))
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
  const objUser = new User(req.swagger.params.body.value);
  objUser.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : err,
    }));
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.updateAccount = (req, res) => {
  const objUser = new User(req.swagger.params.body.value);
  objUser.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(status => res.json({ status, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }));
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.viewAccount = (req, res) => {
  const objUser = new User();
  objUser.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(objUser.cleanResponse(result, { message: 'Found' })))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

module.exports = user;
