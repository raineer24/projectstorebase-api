const query = require('../../service/query');
const Log = require('../logs/log');
const OrderItem = require('./orderItem');
// const log = require('color-logs')(true, true, 'Items');

const orderItem = {};

let userid = '';

/**
* Add an orderItem
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderItem.addOrderItem = (req, res) => {
  userid = req.swagger.params.body.value.user_id;
  const itemid = req.swagger.params.body.value.item_id;
  const instOrderItem = new OrderItem(req.swagger.params.body.value);
  instOrderItem.create()
    .then((id) => {
      new Log({
        message: `Add item id:${itemid} to order`, action: 'ORDER_ITEM_CREATE', type: 'INFO', user_id: `${userid}`,
      }).create();
      return res.json({ id, message: 'Saved' });
    })
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
  // const userid = req.swagger.params.body.value.user_id;
  const itemid = req.swagger.params.body.value.item_id;
  const instOrderItem = new OrderItem(req.swagger.params.body.value);
  instOrderItem.update(query.validateParam(req.swagger.params, 'id', 0))
    .then((msg) => {
      new Log({
        message: `Update item id:${itemid} in current order`, action: 'ORDER_ITEM_UPDATE', type: 'INFO', user_id: `${userid}`,
      }).create();
      return res.json({ message: `Updated ${msg}` });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
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
  const instOrderItem = new OrderItem({});
  instOrderItem.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    orderkey: query.validateParam(req.swagger.params, 'key', ''),
    orderId: query.validateParam(req.swagger.params, 'orderId', ''),
    addCategory: query.validateParam(req.swagger.params, 'addCategory', ''),
  })
    .then((result) => {
      new Log({
        message: 'Show all ordered items', action: 'ORDER_ITEM_GET', type: 'INFO',
      }).create();
      return res.json(result);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_GET', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

orderItem.removeOrderItem = (req, res) => {
  // const itemid = req.swagger.params.body.value.id;
  const instOrderItem = new OrderItem({});
  const itemid = req.swagger.params.id.value;
  instOrderItem.removeById(query.validateParam(req.swagger.params, 'id', 0))
    .then((message) => {
      new Log({
        message: `Remove item id:${itemid} from current order`, action: 'ORDER_ITEM_REMOVE', type: 'INFO', user_id: `${userid}`,
      }).create();
      return res.json({ message });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_ITEM_REMOVE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : err });
    })
    .finally(() => {
      instOrderItem.release();
    });
};

module.exports = orderItem;
