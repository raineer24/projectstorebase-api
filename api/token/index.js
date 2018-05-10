// const query = require('../../service/query');
const Log = require('../logs/log');
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
  new Log({ message: 'TOKEN_CHECK', type: 'INFO' }).create();
  const instToken = new Token();
  instToken.check(req.swagger.params.body.value)
    .then((resultList) => {
      let response;
      if (resultList[0].dateExpiration >= Date.now() && resultList[0].valid === '1') {
        response = res.json({ message: 'Valid' });
      } else {
        response = res.json({ message: 'Invalid' });
      }
      return response;
    })
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instToken.release();
    });
};

module.exports = token;
