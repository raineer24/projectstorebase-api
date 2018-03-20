// const query = require('../../service/query');
const Rating = require('./rating');
const Log = require('../logs/log');
// const Util = require('../helpers/util');

const rating = {};


/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
rating.createRating = (req, res) => {
  new Log({ message: 'RATING_CREATE', type: 'INFO' }).create();
  const instRating = new Rating(req.swagger.params.body.value);
  instRating.create()
    .then(result => res.json({ message: result }))
    .catch((err) => {
      new Log({ message: `RATING_CREATE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : err });
    })
    .finally(() => {
      instRating.release();
    });
};

module.exports = rating;
