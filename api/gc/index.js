const query = require('../../service/query');
const Gc = require('./gc');
// const log = require('color-logs')(true, true, '');
const Log = require('../logs/log');

const gc = {};


/**
* Update
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
gc.updateGc = (req, res) => {
  new Log({ message: 'GC_UPDATE', type: 'INFO' }).create();
  const instGc = new Gc(req.swagger.params.body.value);
  instGc.update(query.validateParam(req.swagger.params, 'code', ''))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `GC_UPDATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instGc.release();
    });
};

/**
* Get
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
gc.getGc = (req, res) => {
  new Log({ message: 'GC_GET', type: 'INFO' }).create();
  const instGc = new Gc({});
  instGc.getByValue(query.validateParam(req.swagger.params, 'code', ''), 'code')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `GC_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instGc.release();
    });
};

module.exports = gc;
