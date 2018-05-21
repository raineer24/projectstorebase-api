const query = require('../../service/query');
const Log = require('../logs/log');

const OrderSeller = require('./orderseller');

const orderseller = {};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderseller.getAllOrderSellers = (req, res) => {
  const instOrder = new OrderSeller({});
  instOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'selleraccount_id', `${res.id}`),
  })
    .then((result) => {
      res.json(result);
      new Log({
        message: 'Show all order sellers', action: 'ORDERSELLER_LIST', type: 'INFO', selleraccount_id: `${result.id}`,
      }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDERSELLER_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrder.release();
    });
};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderseller.createOrderSeller = (req, res) => {
  new Log({ message: 'Created a new order seller', action: 'ORDERSELLER_CREATE', type: 'INFO' }).create();
  const instOrderseller = new OrderSeller(req.swagger.params.body.value);
  instOrderseller.create()
    .then((result) => {
      if (result === 'Existing') {
        return res.status(201).json({
          message: result,
        });
      }
      return res.json({
        message: result,
      });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDERSELLER_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : err });
    })
    .finally(() => {
      instOrderseller.release();
    });
};

/**
* Get an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderseller.getOrderseller = (req, res) => {
  new Log({ message: 'Get specific order by seller account', action: 'ORDERSELLER_GET', type: 'INFO' }).create();
  const instOrderseller = new OrderSeller({});
  instOrderseller.getById(query.validateParam(req.swagger.params, 'id', ''))
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDERSELLER_GET', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instOrderseller.release();
    });
};

module.exports = orderseller;
