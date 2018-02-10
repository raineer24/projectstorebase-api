const query = require('../../service/query');
// const Order = require('../orders/order');
const OrderItem = require('./orderItem');
const Log = require('../logs/log');
// const Util = require('../helpers/util');

const orderItem = {};

/**
* Add an orderItem
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderItem.addOrderItem = (req, res) => {
  new Log({ message: 'ORDER_ITEM_CREATE', type: 'INFO' }).create();
  const instOrderItem = new OrderItem(req.swagger.params.body.value);
  instOrderItem.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

/**
* Update an orderItem
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderItem.updateOrderItem = (req, res) => {
  new Log({ message: 'ORDER_ITEM_UPDATE', type: 'INFO' }).create();
  const instOrderItem = new OrderItem(req.swagger.params.body.value);
  instOrderItem.update(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

/**
* Get orderItems
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderItem.getOrderItems = (req, res) => {
  new Log({ message: 'ORDER_ITEM_GET', type: 'INFO' }).create();
  const instOrderItem = new OrderItem({});
  instOrderItem.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    orderkey: query.validateParam(req.swagger.params, 'key', ''),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

orderItem.removeOrderItem = (req, res) => {
  new Log({ message: 'ORDER_ITEM_REMOVE', type: 'INFO' }).create();
  const instOrderItem = new OrderItem({});
  instOrderItem.removeById(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(message => res.json({ message }))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_REMOVE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

module.exports = orderItem;
