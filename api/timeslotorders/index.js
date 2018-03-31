const moment = require('moment');
const query = require('../../service/query');
const Log = require('../logs/log');

const TimeslotOrder = require('./timeslotorder');

const timeslotOrder = {};


/**
* Add
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeslotOrder.addTimeslotOrder = (req, res) => {
  new Log({ message: 'TIMESLOT_ORDER_CREATE', type: 'INFO' }).create();
  const instTimeslotOrder = new TimeslotOrder(req.swagger.params.body.value);
  instTimeslotOrder.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTimeslotOrder.release();
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
  const instTimeslotOrder = new TimeslotOrder({});
  instTimeslotOrder.getByValue(query.validateParam(req.swagger.params, 'orderId', ''), 'order_id')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTimeslotOrder.release();
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
    })
    .finally(() => {
      instTimeslotOrder.release();
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
  const instTimeslotOrder = new TimeslotOrder(req.swagger.params.body.value);
  instTimeslotOrder.updateTimeslotOrder(query.validateParam(req.swagger.params, 'orderId', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `TIMESLOT_ORDER_UPDATE ${err}`, type: 'ERROR' }).create();
      if (err === 'Not found') {
        return res.status(404).json({ message: 'Not found' });
      } else if (err === 'Full') {
        return res.status(409).json({ message: 'Slot is full' });
      }
      return res.status(500).json({ message: 'Failed' });
    })
    .finally(() => {
      instTimeslotOrder.release();
    });
};

module.exports = timeslotOrder;
