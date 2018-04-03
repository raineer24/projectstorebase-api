const query = require('../../service/query');
const Log = require('../logs/log');

const User = require('./user');

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
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.getAllUsers = (req, res) => {
  new Log({ message: 'ORDER_LIST', type: 'INFO' }).create();
  const instUser = new User({});
  instUser.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    // useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `ORDER_LIST ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instUser.release();
    });
};

/**
* Search user in partnerbuyeruser table
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.getUser = (req, res) => {
  new Log({ message: 'PARTNER BUYER USER', type: 'INFO' }).create();
  const instUser = new User();
  instUser.getById(query.validateParam(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(instUser.cleanResponse(result, { message: 'Found' })))
    .catch((err) => {
      new Log({ message: `PARTNER BUYER USER ${err}`, type: 'ERROR' }).create();
      return res.status(404).json({ message: 'Not found' });
    }))
    .finally(() => {
      instUser.release();
    });
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
    .then(userData => res.json(instUser.cleanResponse(userData, { message: 'Saved' })))
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
    .then((resultList) => {
      if (!resultList[0].id) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(instUser.cleanResponse(resultList[0], { message: 'Found' }));
    })
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instUser.release();
    });
};

module.exports = user;
