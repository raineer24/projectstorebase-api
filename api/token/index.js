const query = require('../../service/query');
const Log = require('../logs/log');
const log = require('color-logs')(true, true, 'Token');
const Token = require('./token');

const token = {};

token.connectDb = (req, res) => {
  const instToken = new Token({});
  instToken.testConnection()
    .then(result => res.json({ message: result }))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
token.check = (req, res) => {
  const instToken = new Token();
  instToken.check(req.swagger.params.body.value)
    .then((resultList) => {
      // return res.json(instToken.cleanResponse(resultList[0], { message: 'Found' }));
      log.info(resultList[0])
      if(resultList[0].dateExpiration >= Date.now() && resultList[0].valid == '1') {
        return res.json({ message: 'Valid' });
      } else {
        return res.json({ message: 'Invalid' });
      }

    })
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instToken.release();
    });
};

module.exports = token;
