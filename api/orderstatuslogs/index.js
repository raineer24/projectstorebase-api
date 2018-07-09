const query = require('../../service/query');
const Log = require('../logs/log');

const OrderStatusLogs = require('./orderstatuslogs');

const ordersellerlogs = {};


ordersellerlogs.showallLogs = (req, res) => {
  const instOrderStatusLog = new OrderStatusLogs({});
  instOrderStatusLog.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 5000), {
    orderId: query.validateParam(req.swagger.params, 'orderId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
    })
    .finally(() => {
      instOrderStatusLog.release();
    });
};

module.exports = ordersellerlogs;
