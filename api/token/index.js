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
  instToken.check(req.swagger.params.body.value, 'USER')
    .then(result => res.json({ message: result }))
    .catch((err) => {
      switch (err) {
        case 'Not Found':
        case 'Invalid':
          return res.status(404).json({ message: 'Invalid' });
        default:
          return res.status(500).json({ message: 'Failed' });
      }
    })
    .finally(() => {
      instToken.release();
    });
};

/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
token.checkPartner = (req, res) => {
  new Log({ message: 'TOKEN_CHECK', type: 'INFO' }).create();
  const instToken = new Token();
  instToken.check(req.swagger.params.body.value, 'PARTNER_USER')
    .then(result => res.json({ message: result }))
    .catch((err) => {
      switch (err) {
        case 'Not Found':
        case 'Invalid':
          return res.status(404).json({ message: 'Invalid' });
        default:
          return res.status(500).json({ message: 'Failed' });
      }
    })
    .finally(() => {
      instToken.release();
    });
};

module.exports = token;
