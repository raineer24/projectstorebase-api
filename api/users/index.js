// const BluePromise = require('bluebird');
const User = require('./user');
const query = require('../../service/query');
const user = {};

/**
* User authentication and authorization
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
user.login = (req, res) => {
  User.authenticate(req.swagger.params.body.value.username, req.swagger.params.body.value.password)
    .then(userAuth => userAuth)
    .then(User.authorize)
    .then((result) => {
      return res.json(User.cleanUp(result, { message: 'Found' }));
    })
    .catch(() => {
      return res.status(404).json({
        message: 'Not found',
      });
    });
};
user.register = (req, res) => {
  User.save(req.swagger.params.body.value.email, req.swagger.params.body.value.password, req.swagger.params.body.value.email, req.swagger.params.body.value.uiid)
    .then((id) => {
      return res.json({
        id: id,
        message: 'Saved',
      });
    })
    .catch((err) => {
      return res.status(err === 'Found' ? 201 : 500).json({
        message: err === 'Found' ? 'Existing' : 'Failed',
      });
    });
};

user.viewProfile = (req, res) => {
  User.getById(query.validateParam(req.swagger.params, 'id', 0))
    .then((result) => {
      return res.json(User.cleanUp(result, { message: 'Found' }));
    })
    .catch((err) => {
      return res.status(404).json({
        message: 'Not found',
      });
    });
};

module.exports = user;
