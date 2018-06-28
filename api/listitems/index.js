const query = require('../../service/query');
const ListItem = require('./listitem');
const Log = require('../logs/log');

const listitem = {};

listitem.getAllListItems = (req, res) => {
  // new Log({ message: 'Show all list of items',
  // action: 'LIST_ITEM_LIST', type: 'INFO' }).create();
  const instListItem = new ListItem({});
  instListItem.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    listId: query.validateParam(req.swagger.params, 'listId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_ITEM_LIST ', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instListItem.release();
    });
};

listitem.getAllListItemsByItem = (req, res) => {
  // new Log({ message: 'Show all list of items by item',
  // action: 'LIST_ITEM_LIST_BY_ITEM', type: 'INFO' }).create();
  const instListItem = new ListItem({});
  instListItem.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    itemId: query.validateParam(req.swagger.params, 'itemId', 0),
    useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_ITEM_LIST_BY_ITEM', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instListItem.release();
    });
};

listitem.saveListItem = (req, res) => {
  // new Log({ message: 'Save item to list', action: 'LIST_ITEM_ADD', type: 'INFO' }).create();
  const instListItem = new ListItem(req.swagger.params.body.value);
  instListItem.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_ITEM_ADD', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instListItem.release();
    });
};

listitem.removeListItem = (req, res) => {
  // new Log({ message: 'Remove an item from list',
  // action: 'LIST_ITEM_REMOVE', type: 'INFO' }).create();
  const instListItem = new ListItem({});
  instListItem.removeById(query.validateParam(req.swagger.params, 'id', 0))
    .then(message => res.json({ message }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_ITEM_REMOVE', type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instListItem.release();
    });
};

module.exports = listitem;
