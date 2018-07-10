const query = require('../../service/query');
const List = require('./list');
const Log = require('../logs/log');

const list = {};

list.getAllList = (req, res) => {
  // new Log({ message: 'Get all list', action: 'LIST_LIST', type: 'INFO' }).create();
  const instList = new List({});
  instList.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    useraccountId: query.validateParam(req.swagger.params, 'useraccountId', 0),
  })
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_LIST', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not Found' : 'Failed' });
    })
    .finally(() => {
      instList.release();
    });
};

list.saveList = (req, res) => {
  // new Log({ message: 'Save new list', action: 'LIST_ADD', type: 'INFO' }).create();
  const instList = new List(req.swagger.params.body.value);
  instList.create(query.validateParam(req.swagger.params, 'useraccountId', 0))
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_ADD', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instList.release();
    });
};

list.updateList = (req, res) => {
  // new Log({ message: 'Updating existing list of user',
  // action: 'LIST_UPDATE', type: 'INFO' }).create();
  const instList = new List(req.swagger.params.body.value);
  instList.update(query.validateParam(req.swagger.params, 'id', 0))
    .then(msg => res.json({ message: `Updated ${msg}` }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'LIST_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instList.release();
    });
};

list.removeList = (req, res) => {
  // new Log({ message: 'Remove existing list of user',
  // action: 'LIST_REMOVE', type: 'INFO' }).create();
  const instList = new List({});
  instList.removeById(query.validateParam(req.swagger.params, 'id', 0))
    .then(message => res.json({ message }))
    .catch((err) => {
      new Log({ message: `LIST_REMOVE ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instList.release();
    });
};

module.exports = list;
