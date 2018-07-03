const query = require('../../service/query');
const Log = require('../logs/log');

const Selleraccount = require('./selleraccount');

const selleraccount = {};

selleraccount.connectDb = (req, res) => {
  const instSellerAccount = new Selleraccount({});
  instSellerAccount.testConnection()
    .then(result => res.json({ message: result }))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

/**
* Create seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.registerAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCOUNT_CREATE', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount(req.swagger.params.body.value);
  instSellerAccount.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `SELLER_ACCOUNT_CREATE ${err}`, type: 'ERROR' }).create();
      switch (err) {
        case 'Username Found':
          return res.status(409).json({ message: 'Username Already Taken' });
        case 'Email Found':
          return res.status(409).json({ message: 'Email Already Taken' });
        default:
          return res.status(500).json({ message: 'Failed' });
      }
    })
    .finally(() => {
      instSellerAccount.release();
    });
};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.getAllSellerUsers = (req, res) => {
  new Log({ message: 'SELLER_ACCOUNT_USER_LIST', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount({});
  instSellerAccount.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'sellersId', 0),
    count: query.validateParam(req.swagger.params, 'count', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `SELLER_ACCOUNT_USER_LIST ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instSellerAccount.release();
    });
};

/**
* Update seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.updateAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCOUNT_UPDATE', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount(req.swagger.params.body.value);
  instSellerAccount.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(status => res.json({ status, message: 'Updated' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_UPDATE', type: 'ERROR' }).create();
      switch (err) {
        case 'Not Found':
          return res.status(404).json({ message: 'Not Found' });
        case 'Email Found':
          return res.status(409).json({ message: 'Email Already Taken' });
        default:
          return res.status(500).json({ message: 'Failed' });
      }
    })
    .finally(() => {
      instSellerAccount.release();
    });
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.viewAccount = (req, res) => {
  new Log({ message: 'View seller account', action: 'SELLER_ACCOUNT_VIEW', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount();
  instSellerAccount.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then((resultList) => {
      if (!resultList[0].id) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(instSellerAccount.cleanResponse(resultList[0], { message: 'Found' }));
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_VIEW', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instSellerAccount.release();
    });
};

/**
* User authentication and authorization
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.loginAccount = (req, res) => {
  const instSellerAccount = new Selleraccount(req.swagger.params.body.value);
  instSellerAccount.authenticate()
    .then(userAuth => userAuth)
    .then(instSellerAccount.authorize)
    .then((result) => {
      new Selleraccount({ id: result.id, lastLogin: result.dateAuthenticated }).update(result.id);
      res.json(instSellerAccount.cleanResponse(result, { message: 'Found' }));
      new Log({
        message: 'Logged into Seller Account', action: 'SELLER_ACCOUNT_LOGIN', type: 'INFO', selleraccount_id: `${result.id}`,
      }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_LOGIN', type: 'ERROR' }).create();
      switch (err) {
        case 'Not Found':
          return res.status(404).json({ message: 'Not Found' });
        case 'Disabled':
          return res.status(403).json({ message: 'Disabled' });
        default:
          return res.status(500).json({ message: 'Failed' });
      }
    })
    .finally(() => {
      instSellerAccount.release();
    });
};

/**
* Change password
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.changePassword = (req, res) => {
  new Log({ message: 'Change password.', action: 'SELLER_ACCOUNT_CHANGE_PASSWORD', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount(req.swagger.params.body.value);
  instSellerAccount.update(query.validateParam(req.swagger.params, 'id', 0), true)
    .then(status => res.json({ status, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }))
    .finally(() => {
      instSellerAccount.release();
    });
};

/**
* Reset password
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.resetPassword = (req, res) => {
  new Log({ message: 'Reset password.', action: 'SELLER_ACCOUNT_RESET_PASSWORD', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount();
  instSellerAccount.resetPassword(query.validateParam(req.swagger.params, 'email', ''))
    .then(status => res.json({ status, message: 'Success' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }))
    .finally(() => {
      instSellerAccount.release();
    });
};


/**
* Get user roles
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.getRoles = (req, res) => {
  const instSellerAccount = new Selleraccount();
  instSellerAccount.getRoles()
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_ROLES', type: 'ERROR' }).create();
      return res.status(500).json({ message: 'Failed' });
    })
    .finally(() => {
      instSellerAccount.release();
    });
};


module.exports = selleraccount;
