// const BluePromise = require('bluebird');
const User = require('./user');

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
    .then((response) => {
      response.message = 'Found';
      return res.json(response);
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
      response.message = 'Saved';
      return res.json(response);
    })
    .catch((err) => {
      return res.status(err === 'Found' ? 201 : 500).json({
        message: err === 'Found' ? 'Existing' : 'Failed',
      });
    });
};

module.exports = user;
