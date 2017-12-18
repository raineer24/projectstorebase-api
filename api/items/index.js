// const BluePromise = require('bluebird');
// // const _ = require('underscore');
// const connection = require('../../service/connection');
const query = require('../../service/query');
const Item = require('./item');

const item = {};

item.listAllItems = (req, res) => {
  const objItem = new Item({});
  objItem.findAll(query.validateParam(req.swagger.params, 'offset', 0), query.validateParam(req.swagger.params, 'limit', 10), [])
    .then(result => res.json({ list: result, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }));
};

item.addItem = (req, res) => {
  const objItem = new Item(req.swagger.params.body.value);
  objItem.create()
    .then(id => res.json({ id, message: 'Created' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : 'Failed',
    }));
};

module.exports = item;
