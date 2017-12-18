// const BluePromise = require('bluebird');
// // const _ = require('underscore');
// const connection = require('../../service/connection');
// const query = require('../../service/query');
const Item = require('./item');

const item = {};

item.listAllItems = (req, res) => {
  const objItem = new Item({
    id: 1,
  });
  objItem.findAll(0, 10, [])
    .then(result => res.json({ list: result, message: 'Updated' }))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }));
};

module.exports = item;
