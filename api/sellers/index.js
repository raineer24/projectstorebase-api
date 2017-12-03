// const BluePromise = require('bluebird');
// const Conn = require('../../service/connection');
const Seller = require('./seller');
const query = require('../../service/query');

const seller = {};

/**
* Create seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.registerAccount = (req, res) => {
  const objSeller = new Seller({
    username: req.swagger.params.body.value.email,
    password: req.swagger.params.body.value.password,
    email: req.swagger.params.body.value.email,
    name: req.swagger.params.body.value.name,
  });
  objSeller.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : 'Failed',
    }));
};

/**
* Update seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.updateAccount = (req, res) => {
  const objSeller = new Seller({
    id: query.validateParam(req.swagger.params, 'id', 0),
    username: req.swagger.params.body.value.email,
    password: req.swagger.params.body.value.password,
    email: req.swagger.params.body.value.email,
    name: req.swagger.params.body.value.name,
  });
  objSeller.update()
    .then(status => res.json({ status, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : 'Failed',
    }));
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
seller.viewProfile = (req, res) => {
  const objSeller = new Seller();
  objSeller.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(Seller.cleanResponse(result, { message: 'Found' })))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

module.exports = seller;
