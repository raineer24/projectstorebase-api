const moment = require('moment');
const query = require('../../service/query');
const Log = require('../logs/log');

const Timeslot = require('./timeslot');

const timeSlot = {};


/**
* Add
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeSlot.addTimeslot = (req, res) => {
  const instTimeslot = new Timeslot(req.swagger.params.body.value);
  instTimeslot.create()
    .then((id) => {
      res.json({ id, message: 'Saved' });
      new Log({ message: 'Create a new timeslot', action: 'TIMESLOT_CREATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTimeslot.release();
    });
};

/**
* Get a record
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeSlot.getTimeslot = (req, res) => {
  const instTimeslot = new Timeslot({});
  instTimeslot.getById(query.validateParam(req.swagger.params, 'id', ''))
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not Found' });
      }
      new Log({ message: 'Show specific timeslot', action: 'TIMESLOT_GET', type: 'INFO' }).create();
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_GET', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTimeslot.release();
    });
};

/**
* Get all timeslots at a specific range
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeSlot.getTimeslotOrder = (req, res) => {
  const instTimeslot = new Timeslot({});
  instTimeslot.findAll(0, 100, {
    current: moment().format('YYYY-MM-DD'),
  })
    .then(results => results)
    .then(instTimeslot.formatTimeslots)
    .then((resOrder) => {
      if (resOrder.length === 0) {
        return res.status(404).json({ message: 'Not Found' });
      }
      new Log({ message: 'Show all timeslots', action: 'TIMESLOT_GET_ALL', type: 'INFO' }).create();
      return res.json(resOrder);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_GET_ALL', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTimeslot.release();
    });
};

/**
* Update a record
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeSlot.updateTimeslot = (req, res) => {
  const instTimeslot = new Timeslot(req.swagger.params.body.value);
  instTimeslot.updateTimeslot(query.validateParam(req.swagger.params, 'id', 0))
    .then((msg) => {
      res.json({ message: `Updated ${msg}` });
      new Log({ message: 'Successfully updated a specific timeslot', action: 'TIMESLOT_UPDATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOT_UPDATE', type: 'ERROR' }).create();
      if (err === 'Not Found') {
        return res.status(404).json({ message: 'Not Found' });
      } else if (err === 'Full') {
        return res.status(409).json({ message: 'Slot is full' });
      }
      return res.status(500).json({ message: 'Failed' });
    })
    .finally(() => {
      instTimeslot.release();
    });
};

/**
* Update a record
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
timeSlot.updateAllTimeslots = (req, res) => {
  // const instTimeslotOrder = new TimeslotOrder(req.swagger.params.body.value);
  const instTimeslot = new Timeslot({});
  instTimeslot.updateAllTimeSlots(req.swagger.params.body.value)
  // instTimeslotOrder.updateTimeslotOrder(query.validateParam(req.swagger.params, 'orderId', 0))
    .then((msg) => {
      res.json({ message: `Updated ${msg}` });
      new Log({ message: 'Successfully updated the all timeslots', action: 'TIMESLOTS_UPDATE_ALL', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TIMESLOTS_UPDATE_ALL', type: 'ERROR' }).create();
      if (err === 'Not Found') {
        return res.status(404).json({ message: 'Not Found' });
      }
      return res.status(500).json({ message: 'Failed' });
    })
    .finally(() => {
      instTimeslot.release();
    });
};

module.exports = timeSlot;
