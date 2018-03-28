// const BluePromise = require('bluebird');
// const Conn = require('../../service/connection');
const Selleracct = require('./selleraccount');
const query = require('../../service/query');
const Log = require('../logs/log');

const selleraccount = {};

/**
* Create seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.registerAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCT_CREATE', type: 'INFO' }).create();
  new Selleracct(req.swagger.params.body.value).create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `SELLER_ACCT_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    });
};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.getAllSellerUsers = (req, res) => {
  new Log({ message: 'SELLER_ACCT_USER_LIST', type: 'INFO' }).create();
  const instSelleracct = new Selleracct({});
  instSelleracct.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `ORDER_LIST ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instSelleracct.release();
    });
};

/**
* Update seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.updateAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCT_UPDATE', type: 'INFO' }).create();
  new Selleracct(req.swagger.params.body.value).update(query.validateParam(req.swagger.params, 'id', 0))
    .then(status => res.json({ status, message: 'Updated' }))
    .catch((err) => {
      new Log({ message: `SELLER_ACCT_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
    });
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
selleraccount.viewAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCT_GET', type: 'INFO' }).create();
  new Selleracct().getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(Selleracct.cleanResponse(result, { message: 'Found' })))
    .catch((err) => {
      new Log({ message: `SELLER_ACCT_GET ${err}`, type: 'ERROR' }).create();
      return res.status(404).json({ message: 'Not found' });
    });
};

module.exports = selleraccount;
