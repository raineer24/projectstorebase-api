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
  const instUser = new User({});
  instUser.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    // useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then((result) => {
      new Log({ message: 'Successfully retrieve all users', action: 'USER_LIST', type: 'INFO' }).create();
      return res.json(result);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'USER_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instUser.release();
    });
};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.getAllUsersAdmin = (req, res) => {
  const instUser = new User({});
  instUser.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), { useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 1) })
    .then((result) => {
      new Log({ message: 'Show all users', action: 'ADMIN_USER_LIST', type: 'INFO' }).create();
      return res.json(result);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ADMIN_USER_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
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
    .then((result) => {
      new Log({
        message: 'Logged into user account', action: 'USER_LOGIN', type: 'INFO', user_id: `${result.id}`,
      }).create();
      return res.json(instUser.cleanResponse(result, { message: 'Found' }));
    })
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
  new Log({ message: 'Create new user account', action: 'USER_REGISTER', type: 'INFO' }).create();
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
  new Log({
    message: 'Updated current user account', action: 'USER_UPDATE', type: 'INFO', user_id: `${res.id}`,
  }).create();
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
* User registration
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.changePassword = (req, res) => {
  new Log({ message: 'Change password initiated.', action: 'USER_CHANGE_PASSWORD', type: 'INFO' }).create();
  const instUser = new User(req.swagger.params.body.value);
  instUser.update(query.validateParam(req.swagger.params, 'id', 0), true)
    .then(status => res.json({ status, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
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
user.forgotPassword = (req, res) => {
  new Log({ message: 'Reset password initiated.', action: 'USER_SEND_PASSWORD_RESET_EMAIL', type: 'INFO' }).create();
  const instUser = new User();
  instUser.sendPasswordResetEmail(req.swagger.params.body.value)
    .then(status => res.json({ status, message: 'Success' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'USER_SEND_PASSWORD_RESET_EMAIL', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
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
