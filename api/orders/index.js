const query = require('../../service/query');
// const Order = require('../orders/order');
const Order = require('./order');
const Log = require('../logs/log');
// const Util = require('../helpers/util');

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
  objOrder.getByValue(query.validateParam(req.swagger.params, 'key', ''), 'orderkey')
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `ORDER_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};
