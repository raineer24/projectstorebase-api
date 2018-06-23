const query = require('../../service/query');
const Item = require('./item');
const Log = require('../logs/log');

const item = {};

item.listItems = (req, res) => {
  // new Log({ message: 'Show list of items', action: 'ITEM_LIST', type: 'INFO' }).create();
  const instItem = new Item({});
  instItem.searchAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    keyword: query.validateParam(req.swagger.params, 'keyword', ''),
    category1: query.validateParam(req.swagger.params, 'category1', ''),
    category2: query.validateParam(req.swagger.params, 'category2', ''),
    category3: query.validateParam(req.swagger.params, 'category3', ''),
  }, query.validateParam(req.swagger.params, 'sortBy', ''), query.validateParam(req.swagger.params, 'sort', ''))
    .then(result => result)
    .then(instItem.getRelatedCategories)
    .then(result => res.json({
      list: result.list,
      categories: result.categories,
      message: result.length ? result.length : 0,
    }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ITEM_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
    .finally(() => {
      instItem.release();
    });
};

item.previewItem = (req, res) => {
  new Log({ message: 'Show list of items', action: 'ITEM_LIST', type: 'INFO' }).create();
  new Log({ message: 'ITEM_GET', type: 'INFO' }).create();
  const instItem = new Item();
  instItem.findById(query.validateParam(req.swagger.params, 'id', 0))
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ITEM_GET', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
    .finally(() => {
      instItem.release();
    });
};

item.addItem = (req, res) => {
  new Log({ message: 'Adding a new item to system', action: 'ITEM_ADD', type: 'INFO' }).create();
  const instItem = new Item(req.swagger.params.body.value);
  instItem.create()
    .then(id => res.json({ id, message: 'Existing' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ITEM_ADD', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instItem.release();
    });
};

item.getItemSuggestions = (req, res) => {
  new Log({ message: 'Show suggested items', action: 'ITEM_GET_SUGGESTIONS', type: 'INFO' }).create();
  const instItem = new Item();
  instItem.getItemSuggestions(query.validateParam(req.swagger.params, 'id', 0), 0, query.validateParam(req.swagger.params, 'limit', 5))
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'ITEM_GET_SUGGESTIONS', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
    .finally(() => {
      instItem.release();
    });
};

module.exports = item;
