const query = require('../../service/query');
// const Log = require('../logs/log');

const Setting = require('./settings');

const setting = {};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
setting.getSettings = (req, res) => {
  const instSetting = new Setting();
  instSetting.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10))
    .then((result) => {
      res.json(Setting.cleanResponse(result, { message: 'Found' }));
    })
    // .catch((err) => {
    //   return res.status(err).json({ message: 'Not Found!' });
    // })
    .finally(() => {
      instSetting.release();
    });
};

module.exports = setting;
