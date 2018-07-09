const query = require('../../service/query');
const Log = require('../logs/log');

const Voucher = require('./voucher');

const voucher = {};


/**
* Update
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
voucher.updateVoucherStatus = (req, res) => {
  const instvoucher = new Voucher(req.swagger.params.body.value);
  instvoucher.update(query.validateParam(req.swagger.params, 'code', ''))
    .then((msg) => {
      res.json({ message: `Updated ${msg}` });
      new Log({ message: `Successfully updated status of voucher ${msg.code}.`, action: 'UPDATE_VOUCHER', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'UPDATE_VOUCHER', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
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
  const instvoucher = new Voucher({});
  instvoucher.getByValue(query.validateParam(req.swagger.params, 'code', ''), 'code')
    .then((resultList) => {
      if (resultList.length === 0) {
        new Log({ message: 'Failed to retrieve voucher!', action: 'GET_VOUCHER', type: 'INFO' }).create();
        return res.status(404).json({ message: 'Not Found' });
      }
      new Log({ message: `Successfully retrieved voucher ${resultList[0].code}`, action: 'GET_VOUCHER', type: 'INFO' }).create();
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'GET_VOUCHER', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instvoucher.release();
    });
};

module.exports = voucher;
