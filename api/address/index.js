const query = require('../../service/query');
const Log = require('../logs/log');

const Address = require('./address');

const address = {};

address.connectDb = (req, res) => {
  const instSellerAccount = new Address({});
  instSellerAccount.testConnection()
    .then(result => res.json({ message: result }))
    .catch(() => res.status(404).json({
      message: 'Not Found',
    }));
};

/**
* Get address
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
address.getAddress = (req, res) => {
  new Log({ message: 'Return address by id', action: 'ADDRESS_GET', type: 'INFO' }).create();
  const instAddress = new Address({});
  instAddress.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ADDRESS_GET', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
    })
    .finally(() => {
      instAddress.release();
    });
};

/**
* List address
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
address.getAllAddress = (req, res) => {
  new Log({ message: 'Return all address by user', action: 'ADDRESS_LIST', type: 'INFO' }).create();
  const instAddress = new Address({});
  instAddress.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ADDRESS_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
    })
    .finally(() => {
      instAddress.release();
    });
};

/**
* Create address
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
address.createAddress = (req, res) => {
  new Log({ message: 'Create new address', action: 'ADDRESS_CREATE', type: 'INFO' }).create();
  const instAddress = new Address(req.swagger.params.body.value);
  instAddress.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ADDRESS_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instAddress.release();
    });
};

/**
* Update an address
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
address.updateAddress = (req, res) => {
  new Log({ message: 'Update address', action: 'ADDRESS_UPDATE', type: 'INFO' }).create();
  const instAddress = new Address(req.swagger.params.body.value);
  instAddress.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ADDRESS_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
    })
    .finally(() => {
      instAddress.release();
    });
};

module.exports = address;
