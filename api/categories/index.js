const Category = require('./category');
const Log = require('../logs/log');

const category = {};

category.listAllCategories = (req, res) => {
  new Log({ message: 'CATEGORY_LIST_STRUCTURED', type: 'INFO' }).create();
  new Category({}).findStructuredAll()
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `CATEGORY_LIST_STRUCTURED ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    });
};

category.addCategory = (req, res) => {
  new Log({ message: 'CATEGORY_ADD', type: 'INFO' }).create();
  new Category(req.swagger.params.body.value).create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `CATEGORY_ADD ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    });
};

module.exports = category;
