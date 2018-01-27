const query = require('../../service/query');
// const Order = require('../orders/order');
const TimeslotOrder = require('./timeslotorder');
const Log = require('../logs/log');
const moment = require('moment');

const timeslotOrder = {};


/**
* Add
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeslotOrder.addTimeslotOrder = (req, res) => {
  const objTimeslotOrder = new TimeslotOrder(req.swagger.params.body.value);
  new Log({ message: 'TIMESLOT_ORDER_CREATE', type: 'INFO' }).create();
  objTimeslotOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};

/**
* Get a record
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeslotOrder.getTimeslotOrder = (req, res) => {
  new Log({ message: 'TIMESLOT_ORDER_GET', type: 'INFO' }).create();
  new TimeslotOrder({}).getByValue(query.validateParam(req.swagger.params, 'orderId', ''), 'order_id')
    .then((resOrder) => {
      if (resOrder.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resOrder[0]);
    })
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};

/**
* Get all timeslots at a specific range
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeslotOrder.getTimeslotOrderAll = (req, res) => {
  new Log({ message: 'TIMESLOT_ORDER_GET_ALL', type: 'INFO' }).create();
  const instTimeslotOrder = new TimeslotOrder({});
  instTimeslotOrder.findAll(0, 100, {
    current: moment().format('YYYY-MM-DD'),
  })
    .then(results => results)
    .then(instTimeslotOrder.formatTimeslots)
    .then((resOrder) => {
      if (resOrder.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resOrder);
    })
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_GET_ALL ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    });
};

/**
* Update a record
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeslotOrder.updateTimeslotOrder = (req, res) => {
  new Log({ message: 'TIMESLOT_ORDER_UPDATE', type: 'INFO' }).create();
  new TimeslotOrder(req.swagger.params.body.value).update(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    });
};

module.exports = timeslotOrder;
