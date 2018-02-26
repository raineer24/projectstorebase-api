// const BluePromise = require('bluebird');
const User = require('./user');
const query = require('../../service/query');

const user = {};

user.connectDb = (req, res) => {
  const instUser = new User({});
  instUser.testConnection()
    .then(result => res.json({ message: result }))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

/**
* User authentication and authorization
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.loginAccount = (req, res) => {
  const instUser = new User(req.swagger.params.body.value);
  instUser.authenticate()
    .then(userAuth => userAuth)
    .then(instUser.authorize)
    .then(result => res.json(instUser.cleanResponse(result, { message: 'Found' })))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instUser.release();
    });
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.registerAccount = (req, res) => {
  const instUser = new User(req.swagger.params.body.value);
  instUser.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : err,
    }))
    .finally(() => {
      instUser.release();
    });
};

/**
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.updateAccount = (req, res) => {
  const instUser = new User(req.swagger.params.body.value);
  instUser.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(status => res.json({ status, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }))
    .finally(() => {
      instUser.release();
    });
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.viewAccount = (req, res) => {
  const instUser = new User();
  instUser.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(instUser.cleanResponse(result, { message: 'Found' })))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instUser.release();
    });
};

module.exports = user;
