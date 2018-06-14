const query = require('../../service/query');
const Log = require('../logs/log');
const OrderItem = require('./orderItem');

const orderItem = {};

/**
* Add an orderItem
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderItem.addOrderItem = (req, res) => {
  new Log({ message: 'Add item to order', action: 'ORDER_ITEM_CREATE', type: 'INFO' }).create();
  const instOrderItem = new OrderItem(req.swagger.params.body.value);
  instOrderItem.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_CREATE', type: 'ERROR' }).create();
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
  new Log({ message: 'Update item in current order', action: 'ORDER_ITEM_UPDATE', type: 'INFO' }).create();
  const instOrderItem = new OrderItem(req.swagger.params.body.value);
  instOrderItem.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_UPDATE', type: 'ERROR' }).create();
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
  new Log({ message: 'Show all ordered items', action: 'ORDER_ITEM_GET', type: 'INFO' }).create();
  const instOrderItem = new OrderItem({});
  instOrderItem.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    orderkey: query.validateParam(req.swagger.params, 'key', ''),
    orderId: query.validateParam(req.swagger.params, 'orderId', ''),
    addCategory: query.validateParam(req.swagger.params, 'addCategory', ''),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_GET', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

orderItem.removeOrderItem = (req, res) => {
  new Log({ message: 'Remove item from current order', action: 'ORDER_ITEM_REMOVE', type: 'INFO' }).create();
  const instOrderItem = new OrderItem({});
  instOrderItem.removeById(query.validateParam(req.swagger.params, 'id', 0))
    .then(message => res.json({ message }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_REMOVE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

module.exports = orderItem;
