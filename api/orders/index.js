const query = require('../../service/query');
// const Order = require('../orders/order');
const Order = require('./order');
const Log = require('../logs/log');
const Util = require('../helpers/util');

const order = {};

/**
* Add an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.addOrder = (req, res) => {
  const objOrder = new Order(req.swagger.params.body.value);
  new Log({ message: 'ORDER_CREATE', type: 'INFO' }).create();
  objOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `ORDER_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};

/**
* Get an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.getOrder = (req, res) => {
  const objOrder = new Order({});
  new Log({ message: 'ORDER_GET', type: 'INFO' }).create();
  objOrder.getByValue(query.validateParam(req.swagger.params, 'orderkey', ''), 'orderkey')
    .then((resOrder) => {
      if (resOrder.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resOrder[0]);
    })
    .catch((err) => {
      new Log({ message: `ORDER_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};

/**
* Update an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.updateOrder = (req, res) => {
  new Log({ message: 'ORDER_UPDATE', type: 'INFO' }).create();
  new Order(req.swagger.params.body.value).updateByOrderkey(query.validateParam(req.swagger.params, 'orderkeypath', ''))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `ORDER_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    });
};

/**
* Generate orderkey
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.generateOrderKey = (req, res) => {
  new Log({ message: 'ORDERKEY_GENERATE', type: 'INFO' }).create();
  const orderkey = Util.generateOrderKey();
  if (orderkey) {
    return res.json({ orderkey });
  }
  return res.status(500).json({ message: 'Failed to generate' });
};

module.exports = order;
