const query = require('../../service/query');
const Log = require('./log');

const log = {};

log.showallLogs = (req, res) => {
  const instLog = new Log({});
  instLog.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    sellerId: query.validateParam(req.swagger.params, 'sellerId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instLog.release();
    });
};


module.exports = log;
