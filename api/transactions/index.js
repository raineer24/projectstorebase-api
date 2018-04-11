const moment = require('moment');
const query = require('../../service/query');
const Log = require('../logs/log');

const Transaction = require('./transaction');

const transactions = {};

/**
* Get all timeslots at a specific range
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.getTransactions = (req, res) => {
  new Log({ message: 'GET_ALL_TRANSACTIONS', type: 'INFO' }).create();
  const instTransactions = new Transaction({});
  instTransactions.findAll(0, 100, {
    current: moment().format('YYYY-MM-DD'),
  })
    .then(results => results)
    .then(instTransactions.formatTimeslots)
    .then((resOrder) => {
      if (resOrder.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resOrder);
    })
    .catch((err) => {
      new Log({ message: `GET_ALL_TRANSACTIONS ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTransactions.release();
    });
};

module.exports = transactions;
