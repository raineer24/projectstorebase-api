const query = require('../../service/query');
const Log = require('../logs/log');
const log = require('color-logs')(true, true, 'User Account');

const Partnerbuyeruser = require('./partnerbuyeruser');

const partnerbuyeruser = {};

partnerbuyeruser.connectDb = (req, res) => {
  const instUser = new Partnerbuyeruser({});
  instUser.testConnection()
    .then(result => res.json({ message: result }))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

/**
* Add an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
partnerbuyeruser.addUser = (req, res) => {
  new Log({ message: 'Add a new order', action: 'PBU_CREATE', type: 'INFO' }).create();
  const instUser = new Partnerbuyeruser(req.swagger.params.body.value);
  instUser.create()
    .then(status => res.json({ status, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'PBU_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instUser.release();
    });
};

/**
* Add an order
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
partnerbuyeruser.addUsers = (req, res) => {
  new Log({ message: 'Add a new order', action: 'PBU_CREATE', type: 'INFO' }).create();
  const instUser = new Partnerbuyeruser(req.swagger.params.body.value);
  instUser.createMultiple()
    .then(status => res.json({ status, message: 'Saved' }))
    .catch((err) => {
      new Log({ message: `${err}`, action: 'PBU_CREATE', type: 'ERROR' }).create();
      return res.status(err === 'Found' ? 201 : 500).json({ message: err === 'Found' ? 'Existing' : err });
    })
    .finally(() => {
      instUser.release();
    });
};


/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
partnerbuyeruser.getUsers = (req, res) => {
  const instUser = new Partnerbuyeruser();
  const x = req.swagger.params.partnerbuyer_id.value;
  log.info(x);
  instUser.findAll(query.validateParam(req.swagger.params, 'skip', 0), query.validateParam(req.swagger.params, 'limit', 10), {
    partnerBuyer_id: query.validateParam(req.swagger.params, 'partnerBuyer_id', x),
  })
    .then((result) => {
      res.json(result);
      new Log({
        message: 'Show all partner buyer users', action: 'PBU_LIST', type: 'INFO', user_id: `${x}`,
      }).create();
    })
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instUser.release();
    });
};

/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
partnerbuyeruser.getUser = (req, res) => {
  const instUser = new Partnerbuyeruser();
  instUser.getById(query.validateParam(req.swagger.params, 'useraccount_id', 0))
    .then((resultList) => {
      if (!resultList[0].name) {
        return res.status(404).json({ message: 'Not found' });
      }
      return res.json(instUser.cleanResponse(resultList[0], { message: 'Found' }));
    })
    .catch(() => res.status(404).json({
      message: 'Not found',
    }))
    .finally(() => {
      instUser.release();
    });
};

/**
* Update seller
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
partnerbuyeruser.updateAccount = (req, res) => {
  const instPartnerbuyeruser = new Partnerbuyeruser(req.swagger.params.body.value);
  instPartnerbuyeruser.update(query.validateParam(req.swagger.params, 'id', 0))
    .then((status) => {
      new Log({
        message: 'Updated the partner buyer user account.', action: 'PARTNERBUYERUSER_ACCOUNT_UPDATE', type: 'INFO', selleraccount_id: `${status.id}`,
      }).create();
      res.json({ status, message: 'Updated' });
    })
    .catch((err) => {
      new Log({ message: `${err}`, action: 'PARTNERBUYERUSER_ACCOUNT_UPDATE', type: 'ERROR' }).create();
      return res.status(err === 'Not Found' ? 404 : 500).json({ message: err === 'Not Found' ? 'Not found' : 'Failed' });
    })
    .finally(() => {
      instPartnerbuyeruser.release();
    });
};

partnerbuyeruser.sendPasswordEmails = (req, res) => {
  new Log({ message: 'Email sent to partner buyer users.', action: 'PARTNERBUYERUSER_SEND_PASSWORD_RESET_EMAILS', type: 'INFO' }).create();
  const instUser = new Partnerbuyeruser();
  instUser.sendPasswordEmails()
    .then(() => res.json({ message: 'Password reset emails sent' }))
    .catch((err) => {
      new Log({ message: `PARTNERBUYERUSER_SEND_PASSWORD_RESET_EMAILS ${err}`, type: 'ERROR' }).create();
      return res.status(err === 'Not found' ? 404 : 500).json({ message: err === 'Not found' ? 'Not found' : err });
    })
    .finally(() => {
      instUser.release();
    });
};

module.exports = partnerbuyeruser;
