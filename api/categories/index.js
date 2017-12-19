const Category = require('./category');

const category = {};

category.listAllCategories = (req, res) => {
  const objCategory = new Category({});
  objCategory.findStructuredAll()
    .then(result => res.json(result))
    .catch(err => res.status(err === 'Not Found' ? 404 : 500).json({
      message: err === 'Not Found' ? 'Not found' : err,
    }));
};

category.addCategory = (req, res) => {
  const objCategory = new Category(req.swagger.params.body.value);
  objCategory.create()
    .then(id => res.json({ id, message: 'Saved' }))
    .catch(err => res.status(err === 'Found' ? 201 : 500).json({
      message: err === 'Found' ? 'Existing' : 'Failed',
    }));
};

module.exports = category;
