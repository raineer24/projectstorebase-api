const query = require('../../service/query');
const Log = require('../logs/log');
const log = require('color-logs')(true, true, 'User Account');
const Util = require('../helpers/util');

const Order = require('./order');

const order = {};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.getAllOrders = (req, res) => {
  const instOrder = new Order({});
  instOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then((result) => {
      res.json(result);
      new Log({ message: 'Show all orders by seller account', action: 'ORDER_LIST', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrder.release();
    });
};

/**
* Add an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.addOrder = (req, res) => {
  log.info(req.swagger.params.body.value);
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.create()
    .then((id) => {
      res.json({ id, message: 'Saved' });
      new Log({ message: 'Add a new order', action: 'ORDER_CREATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instOrder.release();
    });
};

/**
* Get an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.getOrder = (req, res) => {
  const instOrder = new Order({});
  instOrder.getByValue(query.validateParam(req.swagger.params, 'orderkey', ''), 'orderkey')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      new Log({ message: 'Show current order details', action: 'ORDER_GET', type: 'INFO' }).create();
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_GET', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instOrder.release();
    });
};

/**
* Update an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.updateOrder = (req, res) => {
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.updateByOrderkey(query.validateParam(req.swagger.params, 'orderkeypath', ''))
    .then((msg) => {
      res.json({ message: `Updated ${msg}` });
      new Log({ message: 'Update current order', action: 'ORDER_UPDATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrder.release();
    });
};


/**
* Update an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.updateOrderById = (req, res) => {
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.update(query.validateParam(req.swagger.params, 'id', 0))
    .then((msg) => {
      res.json({ message: `Updated ${msg}` });
      new Log({ message: 'Finalize current order', action: 'ORDER_UPDATE_FINAL', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_UPDATE_FINAL', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrder.release();
    });
};

/**
* Generate orderkey
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.generateOrderKey = (req, res) => {
  const orderkey = Util.generateOrderKey();
  if (orderkey) {
    new Log({ message: 'Generate order key', action: 'ORDERKEY_GENERATE', type: 'INFO' }).create();
    return res.json({ orderkey });
  }
  return res.status(500).json({ message: 'Failed to generate' });
};

/**
* confirm an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.confirmOrder = (req, res) => {
  let gcList = [];
  [gcList] = [req.swagger.params.body.value.gcList];
  const transType = req.swagger.params.body.value.paymentType;
  delete req.swagger.params.body.value.gcList;
  delete req.swagger.params.body.value.paymentType;
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.processOrder(query.validateParam(req.swagger.params, 'id', 0), gcList, transType)
    .then((msg) => {
      res.json({ message: `Processed order ${msg}`, transaction: msg });
      new Log({ message: 'Order confirmation', action: 'ORDER_CONFIRM', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_CONFIRM', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : err });
    })
    .finally(() => {
      instOrder.release();
    });
};

/**
* Seller dashboard list
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.getAllSellerOrders = (req, res) => {
  const instOrder = new Order({});
  instOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'sellerId', 0),
  })
    .then((result) => {
      res.json(result);
      new Log({
        message: 'Show all orders by seller account', action: 'SELLER_ORDER_LIST', type: 'INFO', user_id: `${result.id}`, selleraccount_id: `${result.selleraccound_id}`,
      }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'SELLER_ORDER_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrder.release();
    });
};

module.exports = order;
