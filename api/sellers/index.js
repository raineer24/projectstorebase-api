// const BluePromise = require('bluebird');
// const Conn = require('../../service/connection');
const Seller = require('./seller');
const query = require('../../service/query');
const Log = require('../logs/log');

const seller = {};

/**
* Create seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.registerAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCT_CREATE', type: 'INFO' }).create();
  new Seller(req.swagger.params.body.value).create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `SELLER_ACCT_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    });
};

/**
* Update seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.updateAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCT_UPDATE', type: 'INFO' }).create();
  new Seller(req.swagger.params.body.value).update(query.validateParam(req.swagger.params, 'id', 0))
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
seller.viewAccount = (req, res) => {
  new Log({ message: 'SELLER_ACCT_GET', type: 'INFO' }).create();
  new Seller().getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(Seller.cleanResponse(result, { message: 'Found' })))
    .catch((err) => {
      new Log({ message: `SELLER_ACCT_GET ${err}`, type: 'ERROR' }).create();
      return res.status(404).json({ message: 'Not found' });
    });
};

module.exports = seller;
