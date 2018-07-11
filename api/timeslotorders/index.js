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
  const instTimeslotOrder = new TimeslotOrder(req.swagger.params.body.value);
  instTimeslotOrder.create()
    .then((id) => {
      res.json({ id, message: 'Saved' });
      new Log({ message: 'Add a new timeslot for current order', action: 'TIMESLOT_ORDER_CREATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_ORDER_CREATE', type: 'ERROR' }).create();
      if (err === 'Found') {
        return res.status(201).json({ message: 'Existing' });
      } else if (err === 'Not Found') {
        return res.status(404).json({ message: 'Timeslot not found' });
      } else if (err === 'Full') {
        return res.status(409).json({ message: 'Slot is full' });
      }
      return res.status(500).json({ message: 'Failed' });
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
  const instTimeslotOrder = new TimeslotOrder({});
  instTimeslotOrder.getByValue(query.validateParam(req.swagger.params, 'orderId', ''), 'order_id')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not Found' });
      }
      new Log({ message: 'Show timeslot for current order', action: 'TIMESLOT_ORDER_GET', type: 'INFO' }).create();
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_ORDER_GET', type: 'ERROR' }).create();
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
  const instTimeslotOrder = new TimeslotOrder({});
  instTimeslotOrder.findAll(0, 100, {
    current: moment().format('YYYY-MM-DD'),
  })
    .then(results => results)
    .then(instTimeslotOrder.formatTimeslots)
    .then((resOrder) => {
      if (resOrder.length === 0) {
        return res.status(404).json({ message: 'Not Found' });
      }
      new Log({ message: 'Show all timeslots for order', action: 'TIMESLOT_ORDER_GET_ALL', type: 'INFO' }).create();
      return res.json(resOrder);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_ORDER_GET_ALL', type: 'ERROR' }).create();
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
  const instTimeslotOrder = new TimeslotOrder(req.swagger.params.body.value);
  instTimeslotOrder.updateTimeslotOrder(query.validateParam(req.swagger.params, 'orderId', 0))
    .then((msg) => {
      res.json({ message: `Updated ${msg}` });
      new Log({ message: 'Updating the selected timeslot for order', action: 'TIMESLOT_ORDER_UPDATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_ORDER_UPDATE', type: 'ERROR' }).create();
      if (err === 'Not Found') {
        return res.status(404).json({ message: 'Not Found' });
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
