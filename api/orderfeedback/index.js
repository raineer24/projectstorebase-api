// const query = require('../../service/query');
const Orderfb = require('./orderfeedback');
const Log = require('../logs/log');

const orderfb = {};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
orderfb.createFeedBack = (req, res) => {
  // new Log({ message: 'Saving user rating for order', action:
  // 'FEEDBACK_CREATE', type: 'INFO' }).create();
  const instOrderfb = new Orderfb(req.swagger.params.body.value);
  instOrderfb.create()
    .then(result => res.json({ message: result }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'FEEDBACK_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : err });
    })
    .finally(() => {
      instOrderfb.release();
    });
};

module.exports = orderfb;
