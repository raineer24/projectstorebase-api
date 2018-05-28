const moment = require('moment');
// const query = require('../../service/query');
const Log = require('../logs/log');
const query = require('../../service/query');
const Transaction = require('./transaction');

const transactions = {};

/**
* Get a transactions based on number
* @param {Object} req
* @param {Object} res
* @return {Object}
*/

transactions.getTransaction = (req, res) => {
  new Log({ message: 'Show current order details', action: 'ORDER_GET', type: 'INFO' }).create();
  const instTransactions = new Transaction({});
  instTransactions.getByValue(query.validateParam(req.swagger.params, 'orderId', 0), 'order_id')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ORDER_GET', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTransactions.release();
    });
};

/**
* Get all transactions at a specific range
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.getTransactions = (req, res) => {
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
      new Log({
        message: 'Show all transactions', action: 'GET_ALL_TRANSACTIONS', type: 'INFO', selleraccount_id: `${resOrder.id}`,
      }).create();
      return res.json(resOrder);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'GET_ALL_TRANSACTIONS', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTransactions.release();
    });
};

/**
*Record a transaction
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.recordTransaction = (req, res) => {
  new Log({ message: 'Add a new transaction', action: 'TRANSACTION_CREATE', type: 'INFO' }).create();
  const instTrans = new Transaction(req.swagger.params.body.value);
  instTrans.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TRANSACTION_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTrans.release();
    });
};

/**
* Update a transaction
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.updateTransaction = (req, res) => {
  new Log({ message: 'Update a transaction', action: 'TRANSACTION_UPDATE', type: 'INFO' }).create();
  const instTrans = new Transaction(req.swagger.params.body.value);
  instTrans.update()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TRANSACTION_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instTrans.release();
    });
};

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

module.exports = transactions;
