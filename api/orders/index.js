const query = require('../../service/query');
const Order = require('./order');

const item = {};

item.addOrderItem = (req, res) => {
  const objOrder = new Order(req.swagger.params.body.value);
  objOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : 'Failed',
    }));
};

item.updateOrderItem = (req, res) => {
  const objOrder = new Order(req.swagger.params.body.value);
  objOrder.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(id => res.json({ id, message: 'Updated' }))
    .catch(err => res.status(err === 'Not found' ? 404 : 500).json({
      message: err === 'Not found' ? 'Not found' : 'Failed',
    }));
};
