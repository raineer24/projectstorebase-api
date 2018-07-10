const query = require('../../service/query');
const Rating = require('./rating');
const Log = require('../logs/log');
const log = require('color-logs')(true, true, 'Rating');

const rating = {};

/**
* Get an rating
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
rating.getRating = (req, res) => {
  const instRating = new Rating({});
  instRating.getByValue(query.validateParam(req.swagger.params, 'orderkey', ''), 'orderkey')
    .then((resultList) => {
      if (resultList.length === 0) {
        return res.status(404).json({ message: 'Not Found' });
      }
      new Log({ message: 'Search rating', action: 'RATING_GET', type: 'INFO' }).create();
      return res.json(resultList[0]);
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'RATING_GET', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instRating.release();
    });
};

/**
* List
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
rating.createRating = (req, res) => {
  const instRating = new Rating(req.swagger.params.body.value);
  instRating.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    ratingId: query.validateParam(req.swagger.params, 'Id', 0),
  });
  instRating.create()
    .then((result) => {
      res.json({ message: result });
      new Log({ message: 'Saving user rating for app', action: 'RATING_CREATE', type: 'INFO' }).create();
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'RATING_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : err });
    })
    .finally(() => {
      instRating.release();
    });
  log.info('InfoRating');
};

module.exports = rating;
