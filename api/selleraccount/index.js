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
  new Log({ message: 'SELLER_ACCOUNT_USER_LIST', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount({});
  instSellerAccount.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'sellerId', 0),
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
  new Log({ message: 'View seller account', action: 'SELLER_ACCOUNT_VIEW', type: 'INFO' }).create();
  const instSellerAccount = new Selleraccount();
  instSellerAccount.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(Selleraccount.cleanResponse(result, { message: 'Found' })))
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
      res.json(instSellerAccount.cleanResponse(result, { message: 'Found' }));
      new Log({
        message: 'Logged into Seller Account', action: 'SELLER_ACCOUNT_LOGIN', type: 'INFO', selleraccount_id: `${result.id}`,
      }).create();
    })
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instSellerAccount.release();
    });
};


module.exports = selleraccount;
