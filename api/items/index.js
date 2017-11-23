const BluePromise = require('bluebird');
// const _ = require('underscore');
const connection = require('../../service/connection');
// const query = require('../../service/query');
const Item = require('./item');

const items = BluePromise.promisifyAll(connection.use('item'));

const Items = {
  listAllItems(req, res) {
    // let skip = query.validateParam(req.swagger.params, 'skip', 0);
    // let limit = query.validateParam(req.swagger.params, 'limit', 20);
    // let order = query.validateParam(req.swagger.params, 'order', 'asc');
    // let orderBy = query.validateParam(req.swagger.params, 'orderBy', '');

    res.json({
      message: Item.getAllView(items, null),
    });
  },

};
module.exports = Items;
