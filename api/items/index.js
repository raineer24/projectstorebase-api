// const BluePromise = require('bluebird');
// // const _ = require('underscore');
// const connection = require('../../service/connection');
const query = require('../../service/query');
const Item = require('./item');
// const log = require('color-logs')(true, true, '');

const item = {};

item.listItems = (req, res) => {
  const objItem = new Item({});

  objItem.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    keyword: query.validateParam(req.swagger.params, 'keyword', ''),
    category1: query.validateParam(req.swagger.params, 'category1', ''),
    category2: query.validateParam(req.swagger.params, 'category2', ''),
    category3: query.validateParam(req.swagger.params, 'category3', ''),
  })
    .then(result => res.json({ list: result, message: result.length ? result.length : 0 }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }));
};

item.previewItem = (req, res) => {
  const objItem = new Item();
  objItem.findById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(result))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }));
};

item.addItem = (req, res) => {
  const objItem = new Item(req.swagger.params.body.value);
  objItem.create()
    .then(id => res.json({ id, message: 'Existing' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : 'Failed',
    }));
};

module.exports = item;
