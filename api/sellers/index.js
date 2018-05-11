const query = require('../../service/query');
const Log = require('../logs/log');

const Seller = require('./seller');

const seller = {};

/**
* Create seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.registerAccount = (req, res) => {
  new Log({ message: 'Register new account', action: 'SELLER_ACCT_CREATE', type: 'INFO' }).create();
  const instSeller = new Seller(req.swagger.params.body.value);
  instSeller.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCT_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instSeller.release();
    });
};

/**
* Update seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.updateAccount = (req, res) => {
  new Log({ message: 'Updated a seller account user', action: 'SELLER_ACCT_UPDATE', type: 'INFO' }).create();
  const instSeller = new Seller(req.swagger.params.body.value);
  instSeller.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(status => res.json({ status, message: 'Updated' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCT_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instSeller.release();
    });
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.viewAccount = (req, res) => {
  new Log({ message: 'Viewing seller account user', action: 'SELLER_ACCT_GET', type: 'INFO' }).create();
  const instSeller = new Seller();
  instSeller.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(Seller.cleanResponse(result, { message: 'Found' })))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ACCT_GET', type: 'ERROR' }).create();
      return res.status(404).json({ message: 'Not found' });
    })
    .finally(() => {
      instSeller.release();
    });
};

module.exports = seller;
