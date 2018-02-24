const query = require('../../service/query');
const Voucher = require('./voucher');
// const log = require('color-logs')(true, true, '');
const Log = require('../logs/log');

const voucher = {};


/**
* Update
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
voucher.updatevoucher = (req, res) => {
  new Log({ message: 'voucher_UPDATE', type: 'INFO' }).create();
  const instvoucher = new Voucher(req.swagger.params.body.value);
  instvoucher.update(query.validateParam(req.swagger.params, 'code', ''))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `voucher_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instvoucher.release();
    });
};

/**
* Get
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
voucher.getvoucher = (req, res) => {
  new Log({ message: 'voucher_GET', type: 'INFO' }).create();
  const instvoucher = new Voucher({});
  instvoucher.getByValue(query.validateParam(req.swagger.params, 'code', ''), 'code')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `voucher_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instvoucher.release();
    });
};

module.exports = voucher;
