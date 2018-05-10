const moment = require('moment');
// const query = require('../../service/query');
const Log = require('../logs/log');

const Transaction = require('./transaction');

const transactions = {};

/**
<<<<<<< HEAD
* Get all transactions at a specific range
=======
* Get all timeslots at a specific range
>>>>>>> develop
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.getTransactions = (req, res) => {
<<<<<<< HEAD
  new Log({ message: 'Show all transactions', action: 'GET_ALL_TRANSACTIONS', type: 'INFO' }).create();
=======
  new Log({ message: 'GET_ALL_TRANSACTIONS', type: 'INFO' }).create();
>>>>>>> develop
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
<<<<<<< HEAD
      new Log({ message: `${err}`, action: 'GET_ALL_TRANSACTIONS', type: 'ERROR' }).create();
=======
      new Log({ message: `GET_ALL_TRANSACTIONS ${err}`, type: 'ERROR' }).create();
>>>>>>> develop
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTransactions.release();
    });
};

<<<<<<< HEAD
/**
* Get grand totals at a specific range
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.getGrandTotal = (req, res) => {
  new Log({ message: 'Show totals of all transactions', action: 'TRANSACTIONS_GRANDTOTAL', type: 'INFO' }).create();
  const instTransactions = new Transaction({});
  instTransactions.grandTotal().then(results => results).catch((err) => {
    new Log({ message: `${err}`, action: 'TRANSACTIONS_GRANDTOTAL', type: 'ERROR' }).create();
    return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
  })
    .finally(() => {
      instTransactions.release();
    });
};

=======
>>>>>>> develop
module.exports = transactions;
