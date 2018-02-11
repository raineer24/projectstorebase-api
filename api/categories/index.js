const Category = require('./category');
const Log = require('../logs/log');

const category = {};

category.listAllCategories = (req, res) => {
  new Log({ message: 'CATEGORY_LIST_STRUCTURED', type: 'INFO' }).create();
  const instCategory = new Category({});
  instCategory.findStructuredAll()
    .then(result => res.json(result))
    .catch((err) => {
      new Log({ message: `CATEGORY_LIST_STRUCTURED ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : err });
    })
    .finally(() => {
      instCategory.release();
    });
};

category.addCategory = (req, res) => {
  new Log({ message: 'CATEGORY_ADD', type: 'INFO' }).create();
  const instCategory = new Category(req.swagger.params.body.value);
  instCategory.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `CATEGORY_ADD ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : 'Failed' });
    })
    .finally(() => {
      instCategory.release();
    });
};

module.exports = category;
