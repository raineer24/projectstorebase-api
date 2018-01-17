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
  // const tempKey = Util.generateKey();
  new Log({ message: 'ORDER_ITEM_CREATE', type: 'INFO' }).create();
  new OrderItem(req.swagger.params.body.value).create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
  // const objOrder = new Order(req.swagger.params.body.value);
  // new Log({ message: 'ORDER_CREATE', type: 'INFO' }).create();
  // console.log('create');
  // objOrder.create()
  //   .then((key) => {
  //     new Log({ message: 'ORDER_ITEM_CREATE', type: 'INFO' }).create();
  //     req.swagger.params.body.value.orderkey = key;
  //     new OrderItem(req.swagger.params.body.value).create()
  //       .then(id => res.json({ id, message: 'Saved' }))
  //       .catch((err) => {
  //         new Log({ message: `ORDER_ITEM_CREATE ${err}`, type: 'ERROR' }).create();
  //         return res.status(err === 'Found' ? 201 : 500).json({
  // message: err === 'Found' ? 'Existing' : err });
  //       });
  //   })
  //   .catch((err) => {
  //     new Log({ message: `ORDER_CREATE ${err}`, type: 'ERROR' }).create();
  //     return res.status(err === 'Found' ? 201 : 500).json({
  // message: err === 'Found' ? 'Existing' : err });
  //   });
};

/**
* Update an orderItem
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderItem.updateOrderItem = (req, res) => {
  new Log({ message: 'ORDER_ITEM_UPDATE', type: 'INFO' }).create();
  new OrderItem(req.swagger.params.body.value).update(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
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
  new OrderItem({}).findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    orderkey: query.validateParam(req.swagger.params, 'key', ''),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `ORDER_ITEM_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    });
};

module.exports = orderItem;
