const query = require('../../service/query');
const Order = require('./order');
const Log = require('../logs/log');
const Util = require('../helpers/util');

const order = {};


/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
order.getAllOrders = (req, res) => {
  new Log({ message: 'ORDER_LIST', type: 'INFO' }).create();
  const instOrder = new Order({});
  instOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `ORDER_LIST ${err}`, type: 'ERROR' }).create();
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
  new Log({ message: 'ORDER_CREATE', type: 'INFO' }).create();
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `ORDER_CREATE ${err}`, type: 'ERROR' }).create();
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
  new Log({ message: 'ORDER_GET', type: 'INFO' }).create();
  const instOrder = new Order({});
  instOrder.getByValue(query.validateParam(req.swagger.params, 'orderkey', ''), 'orderkey')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `ORDER_GET ${err}`, type: 'ERROR' }).create();
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
  new Log({ message: 'ORDER_UPDATE', type: 'INFO' }).create();
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.updateByOrderkey(query.validateParam(req.swagger.params, 'orderkeypath', ''))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `ORDER_UPDATE ${err}`, type: 'ERROR' }).create();
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
  new Log({ message: 'ORDERKEY_GENERATE', type: 'INFO' }).create();
  const orderkey = Util.generateOrderKey();
  if (orderkey) {
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
  new Log({ message: 'ORDER_CONFIRM', type: 'INFO' }).create();
  const instOrder = new Order(req.swagger.params.body.value);
  instOrder.processOrder(query.validateParam(req.swagger.params, 'id', 0))
    .then(msg => res.json({ message: `Processed order ${msg}`, transaction: msg }))
    .catch((err) => {
      new Log({ message: `ORDER_CONFIRM ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
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
  new Log({ message: 'SELLER_ORDER_LIST', type: 'INFO' }).create();
  const instOrder = new Order({});
  instOrder.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'sellerId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `SELLER_ORDER_LIST ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instOrder.release();
    });
};

module.exports = order;
