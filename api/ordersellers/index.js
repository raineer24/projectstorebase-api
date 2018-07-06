const query = require('../../service/query');
const Log = require('../logs/log');
const log = require('color-logs')(true, true, 'Order');
const OrderSeller = require('./orderseller');

const orderseller = {};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderseller.getAllOrderSellers = (req, res) => {
  const x = req.swagger.params.sellerId.value;
  log.info(x);
  const instOrder = new OrderSeller({});
  instOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 25), {
    sellerId: query.validateParam(req.swagger.params, 'sellerId', 0),
    sellerAccount: true,
    orderStatus: query.validateParam(req.swagger.params, 'orderStatus', ''),
    orderNumber: query.validateParam(req.swagger.params, 'orderNumber', ''),
    orderDate: query.validateParam(req.swagger.params, 'orderDate', ''),
    deliverDate: query.validateParam(req.swagger.params, 'deliverDate', ''),
    timeslotId: query.validateParam(req.swagger.params, 'timeslotId', ''),
    mode: query.validateParam(req.swagger.params, 'mode', ''),
    count: query.validateParam(req.swagger.params, 'count', ''),
  })
    .then((result) => {
      new Log({
        message: 'Show all order sellers', action: 'ORDERSELLER_LIST', type: 'INFO', selleraccount_id: `${x}`, seller_id: `${x}`,
      }).create();
      return res.json(result);
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
  const instOrderseller = new OrderSeller(req.swagger.params.body.value);
  instOrderseller.create()
    .then((result) => {
      if (result === 'Existing') {
        new Log({
          message: 'Created a new order seller', action: 'ORDERSELLER_CREATE', type: 'INFO', selleraccount_id: `${result.id}`,
        }).create();
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
  const instOrderseller = new OrderSeller({});
  instOrderseller.getByIdJoinOrder(query.validateParam(req.swagger.params, 'id', ''))
    .then((resultList) => {
      if (resultList.length === 0) {
        new Log({ message: 'Get specific order by seller account', action: 'ORDERSELLER_GET', type: 'INFO' }).create();
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

/**
* Update an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderseller.updateOrderseller = (req, res) => {
  const instOrderseller = new OrderSeller(req.swagger.params.body.value);
  instOrderseller.update(query.validateParam(req.swagger.params, 'id', 0))
    .then((msg) => {
      new Log({ message: 'Update orderseller', action: 'ORDERSELLER_UPDATE', type: 'INFO' }).create();
      return res.json({ message: `Updated ${msg}` });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDERSELLER_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrderseller.release();
    });
};

/**
* Update an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderseller.takeOrder = (req, res) => {
  const instOrderseller = new OrderSeller(req.swagger.params.body.value);
  instOrderseller.takeOrder(query.validateParam(req.swagger.params, 'id', 0), req.swagger.params.body.value.selleraccount_id)
    .then((msg) => {
      new Log({ message: 'Update orderseller', action: 'ORDERSELLER_TAKE_ORDER', type: 'INFO' }).create();
      return res.json({ message: `Updated ${msg}` });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDERSELLER_TAKE_ORDER', type: 'ERROR' }).create();
      switch (err) {
        case 'Not Found':
          return res.status(400).json({ message: 'Not Found' });
        case 'User Assigned':
          return res.status(409).json({ message: 'User Assigned' });
        case 'Already Taken':
          return res.status(409).json({ message: 'Already Taken' });
        default:
          return res.status(500).json({ message: 'Failed' });
      }
    })
    .finally(() => {
      instOrderseller.release();
    });
};

module.exports = orderseller;
