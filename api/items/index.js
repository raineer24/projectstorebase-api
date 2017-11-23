/* jslint node: true */
 /*jshint esversion: 6 */
"use strict";

const BluePromise = require('bluebird');
const _ = require('underscore');
const connection = require('../../service/connection');
const query = require('../../service/query');
const items = BluePromise.promisifyAll(connection.use('item'));
const Item = require('./item');

/*
  * listItems
  * List all items using a vi
*/
function listAllItems (req, res) {
  let skip = query.validateParam(req.swagger.params, 'skip', 0);
  let limit = query.validateParam(req.swagger.params, 'limit', 20);
  let order = query.validateParam(req.swagger.params, 'order', 'asc');
  let orderBy = query.validateParam(req.swagger.params, 'orderBy', '');

  Item.getAllView(items, [])
    .then((results) =>  {
      res.json({
        bookmark: '',
        total: results[0].total_rows,
        data: _.map(results[0].rows, function (item, key) { return item.value; } )
      });
    })
    .catch((err) => {
      res.json({
        error: '300',
        message: err
      });
    });
}

module.exports = {
  listAllItems: listAllItems
};
