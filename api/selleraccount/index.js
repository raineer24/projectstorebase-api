const query = require('../../service/query');
const Log = require('../logs/log');

const Selleraccount = require('./selleraccount');

const selleraccount = {};

let selleraccountid = 0;

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
  const instSellerAccount = new Selleraccount(req.swagger.params.body.value);
  instSellerAccount.create()
    .then((id) => {
      new Log({
        message: 'Register seller account.', action: 'SELLER_ACCOUNT_CREATE', type: 'INFO', selleraccount_id: `${id.id}`,
      }).create();
      res.json({ id, message: 'Saved' });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
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
  const instSellerAccount = new Selleraccount({});
  instSellerAccount.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'sellerId', 0),
  })
    .then((result) => {
      new Log({
        message: 'Show all seller users', action: 'SELLER_ACCOUNT_USER_LIST', type: 'INFO', selleraccount_id: selleraccountid,
      }).create();
      res.json(result);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_USER_LIST', type: 'ERROR' }).create();
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
  const instSellerAccount = new Selleraccount(req.swagger.params.body.value);
  instSellerAccount.update(query.validateParam(req.swagger.params, 'id', 0))
    .then((status) => {
      new Log({
        message: 'Updated seller account.', action: 'SELLER_ACCOUNT_UPDATE', type: 'INFO', selleraccount_id: `${status.id}`,
      }).create();
      res.json({ status, message: 'Updated' });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
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
  const instSellerAccount = new Selleraccount();
  instSellerAccount.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then((result) => {
      new Log({
        message: 'View seller account', action: 'SELLER_ACCOUNT_VIEW', type: 'INFO', user_id: `${result.id}`, selleraccount_id: selleraccountid,
      }).create();
      res.json(Selleraccount.cleanResponse(result, { message: 'Found' }));
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCOUNT_VIEW', type: 'ERROR' }).create();
      return res.status(404).json({ message: 'Not found' });
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
      selleraccountid = result.id;
      new Log({
        message: 'Logged into Seller Account', action: 'SELLER_ACCOUNT_LOGIN', type: 'INFO', selleraccount_id: `${result.id}`,
      }).create();
    })
    .catch(err => res.status(404).json({
      message: err,
    }))
    .finally(() => {
      instSellerAccount.release();
    });
};


module.exports = selleraccount;
