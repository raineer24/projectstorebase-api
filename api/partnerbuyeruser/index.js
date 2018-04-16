const query = require('../../service/query');
// const Log = require('../logs/log');

const User = require('./partnerbuyeruser');

const partnerbuyeruser = {};

partnerbuyeruser.connectDb = (req, res) => {
  const instUser = new User({});
  instUser.testConnection()
    .then(result => res.json({ message: result }))
    .catch(() => res.status(404).json({
      message: 'Not found',
    }));
};

// /**
// * Search user in partnerbuyeruser table
// * @param {Object} req
// * @param {Object} res
// * @return {Object}
// */
// partnerbuyeruser.getUser = (req, res) => {
//   new Log({ message: 'PARTNER BUYER USER', type: 'INFO' }).create();
//   const instUser = new User();
//   instUser.getById(query.validateParam(query.validateParam(req.swagger.params, 'id', 0))
//     .then((resultList) => {
//       if (!resultList[0].id) {
//         return res.status(404).json({ message: 'Not found' });
//       }
//       return res.json(instUser.cleanResponse(resultList[0], { message: 'Found' }));
//     })
//     .catch((err) => {
//       new Log({ message: `PARTNER BUYER USER ${err}`, type: 'ERROR' }).create();
//       return res.status(404).json({ message: 'Not found' });
//     }))
//     .finally(() => {
//       instUser.release();
//     });
// };

/**
* View user profile
* @param {Object} req
* @param {Object} res
* @return {Object}
*/
partnerbuyeruser.getUser = (req, res) => {
  const instUser = new User();
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

partnerbuyeruser.sendMassEmails = (req, res) => {
  const instUser = new User();
  instUser.sendMassEmails(query.validateParam(req.swagger.params))
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

module.exports = partnerbuyeruser;
