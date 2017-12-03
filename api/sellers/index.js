// const BluePromise = require('bluebird');
// const Conn = require('../../service/connection');
const Seller = require('./seller');
// const query = require('../../service/query');

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

module.exports = seller;
