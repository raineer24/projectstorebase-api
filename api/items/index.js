// const BluePromise = require('bluebird');
// // const _ = require('underscore');
// const connection = require('../../service/connection');
const query = require('../../service/query');
const Item = require('./item');
// const log = require('color-logs')(true, true, '');
const Log = require('../logs/log');

const item = {};

item.listItems = (req, res) => {
  new Log({ message: 'ITEM_LIST', type: 'INFO' }).create();
  new Item({}).findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    keyword: query.validateParam(req.swagger.params, 'keyword', ''),
    category1: query.validateParam(req.swagger.params, 'category1', ''),
    category2: query.validateParam(req.swagger.params, 'category2', ''),
    category3: query.validateParam(req.swagger.params, 'category3', ''),
  })
    .then(result => res.json({ list: result, message: result.length ? result.length : 0 }))
    .catch((err) => {
      new Log({ message: `ITEM_LIST ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    });
};

item.previewItem = (req, res) => {
  new Log({ message: 'ITEM_GET', type: 'INFO' }).create();
  new Item().findById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `ITEM_GET ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    });
};

item.addItem = (req, res) => {
  new Log({ message: 'ITEM_ADD', type: 'INFO' }).create();
  Item(req.swagger.params.body.value).create()
    .then(id => res.json({ id, message: 'Existing' }))
    .catch((err) => {
      new Log({ message: `ITEM_ADD ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    });
};

module.exports = item;
