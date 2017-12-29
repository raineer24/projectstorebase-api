const query = require('../../service/query');
const Order = require('./order');

const orderItem = {};

orderItem.addOrderItem = (req, res) => {
  const objOrder = new Order(req.swagger.params.body.value);
  objOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : err,
    }));
};

orderItem.updateOrderItem = (req, res) => {
  const objOrder = new Order(req.swagger.params.body.value);
  objOrder.update(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch(err => res.status(err === 'Not found' ? 404 : 500).json({
      message: err === 'Not found' ? 'Not found' : 'Failed',
    }));
};

module.exports = orderItem;
