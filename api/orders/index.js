const query = require('../../service/query');
const Order = require('./order');
const Log = require('../logs/log');

const orderItem = {};

orderItem.addOrderItem = (req, res) => {
  new Log({ message: 'ADD_ORDER_ITEM', type: 'INFO' }).create();
  const objOrder = new Order(req.swagger.params.body.value);
  objOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `ADD_ORDER_ITEM ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};

orderItem.updateOrderItem = (req, res) => {
  new Log({ message: 'UPDATE_ORDER_ITEM', type: 'INFO' }).create();
  const objOrder = new Order(req.swagger.params.body.value);
  objOrder.update(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `UPDATE_ORDER_ITEM ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    });
};

orderItem.getOrderItems = (req, res) => {
  new Log({ message: 'GET_ORDER_ITEMS', type: 'INFO' }).create();
  const objOrder = new Order({});
  objOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    session_id: query.validateParam(req.swagger.params, 'key', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `GET_ORDER_ITEMS ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    });
};

module.exports = orderItem;
