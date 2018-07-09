const moment = require('moment');
// const query = require('../../service/query');
const Log = require('../logs/log');
const log = require('color-logs')(true, true, 'User Account');
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
  const instTransactions = new Transaction({});
  instTransactions.getByValue(query.validateParam(req.swagger.params, 'id', 0), 'id')
    .then((resultList) => {
      if (resultList.length === 0) {
        new Log({ message: `Viewing transactions of order id ${resultList[0].order_id}.`, action: 'GET_TRANSACTION', type: 'INFO' }).create();
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'GET_TRANSACTION', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
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
  log.info(req.swagger.params.header);
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
        message: 'Successfully retrieved all transactions.', action: 'GET_ALL_TRANSACTIONS', type: 'INFO', selleraccount_id: `${resOrder.id}`,
      }).create();
      return res.json(resOrder);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'GET_ALL_TRANSACTIONS', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
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
  const instTrans = new Transaction(req.swagger.params.body.value);
  instTrans.create()
    .then((id) => {
      res.json({ id, message: 'Saved' });
      new Log({ message: `Add a new transaction: transaction id - ${id}.`, action: 'TRANSACTION_CREATE', type: 'INFO' }).create();
    })
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
  const instTrans = new Transaction(req.swagger.params.body.value);
  instTrans.update(query.validateParam(req.swagger.params, 'id', 0))
    .then((msg) => {
      new Log({ message: `Updated transaction ${req.swagger.params.id} successfully.`, action: 'TRANSACTION_UPDATE', type: 'INFO' }).create();
      return res.json({ message: `Updated ${msg}` });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TRANSACTION_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
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
  const instTransactions = new Transaction({});
  instTransactions.grandTotal().then((results) => {
    res.json(results);
    new Log({ message: 'Show totals of all transactions', action: 'TRANSACTIONS_GRANDTOTAL', type: 'INFO' }).create();
  }).catch((err) => {
    new Log({ message: `${err}`, action: 'TRANSACTIONS_GRANDTOTAL', type: 'ERROR' }).create();
    return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
  })
    .finally(() => {
      instTransactions.release();
    });
};

transactions.getTransactionByOrderId = (req, res) => {
  const instTrans = new Transaction({});
  instTrans.getByValue(query.validateParam(req.swagger.params, 'order_id', 0), 'order_id')
    .then((resultList) => {
      if (resultList.length === 0) {
        new Log({ message: `Viewing transactions of order id ${resultList[0].order_id}.`, action: 'GET_TRANSACTION_BY_ORDER', type: 'INFO' }).create();
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'GET_TRANSACTION_BY_ORDER', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instTrans.release();
    });
};

/**
* Update a transaction by order ID
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
transactions.updateTransactionByOrderId = (req, res) => {
  const instTrans = new Transaction(req.swagger.params.body.value);
  instTrans.updateByOrderId(query.validateParam(req.swagger.params, 'order_id', 'order_id'))
    .then((id) => {
      res.json({ id, message: 'Saved' });
      new Log({ message: `Updated transaction ${id} successfully.`, action: 'TRANSACTION_UPDATE_BY_ORDER', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'TRANSACTION_UPDATE_BY_ORDER', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instTrans.release();
    });
};

module.exports = transactions;
