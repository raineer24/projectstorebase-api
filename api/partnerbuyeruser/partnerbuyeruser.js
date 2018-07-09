const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const config = require('../../config/config');
const moment = require('moment');

const Conn = require('../../service/connection');
const Util = require('../helpers/util');
const Mailer = require('../../service/mail');

const Token = require('../token/token');
const User = require('../users/user');

const log = require('color-logs')(true, true, 'Partner User Account');

let that;

function Partnerbuyeruser(user) {
  sql.setDialect('mysql');

  this.model = _.extend(user, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'partnerbuyeruser';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'username',
      'email',
      'name',
      'credit',
      'availablebalance',
      'outstandingbalance',
      'status',
      'dateCreated',
      'dateUpdated',
      'useraccount_id',
      'partner_id',
    ],
  });
  this.sqlTableUser = sql.define({
    name: 'useraccount',
    columns: [
      'id',
      'username',
      'password',
      'email',
      'firstName',
      'lastName',
      'uiid',
      'gender',
      'mobileNumber',
      'dateCreated',
      'dateUpdated',
      'forcedReset',
    ],
  });

  that = this;
}

Partnerbuyeruser.prototype.testConnection = () => new BluePromise((resolve, reject) => {
  if (that.dbConn) {
    resolve(that.dbConn);
    return;
  }
  reject('Not Found');
});

/**
  * User authentication of username and password
  * @param {string} username
  * @param {string} password
  * @return {object}
*/
Partnerbuyeruser.prototype.authenticate = () => new BluePromise((resolve, reject) => {
  const filter = {
    username: that.model.username,
  };

  if (that.model.password) {
    filter.password = that.model.password;
  } else if (that.model.uiid) {
    filter.uiid = that.model.uiid;
  }

  that.findAll(0, 1, filter)
    .then((results) => {
      if (results.length === 0) {
        reject('Not Found');
        return;
      }

      resolve(_.merge({
        authenticated: true,
        token: Util.signToken(results[0].username),
        dateTime: new Date().getTime(),
      }, results[0]));
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Check user entitlement
  * @param {object} userAuth
  * @return {object}
*/
Partnerbuyeruser.prototype.authorize = userAuth => new BluePromise((resolve, reject) => {
  if (!userAuth) {
    reject(null);
    return;
  }
  resolve(_.merge({
    authorize: true,
    roles: [
      'customer',
      'limited',
    ],
    dateAuthenticated: userAuth.dateTime,
    dateAuthorized: new Date().getTime(),
  }, userAuth));
});

/**
  * Save User account
  * @param {string} useraccount_id
  * @return {object}
*/
Partnerbuyeruser.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.useraccount_id, 'useraccount_id')
    .then((results) => {
      if (results.length === 0) {
        log.info('[CREATING PBU]');
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            log.info('PARTNER BUYER USER - CREATE');
            log.info(response);
            that.getById(response.insertId)
              .then((resultList) => {
                if (!resultList[0].id) {
                  reject('Not Found');
                } else {
                  log.info('PARTNER BUYER USER - EMAIL');
                  log.info(resultList[0]);
                  new Mailer(that.mailConfirmation(resultList[0])).send()
                    .then(() => {
                      log.info(`Successfully registered with e-mail ${resultList[0].email}`);
                    })
                    .catch((err) => {
                      log.error(`Failed to send ${err}`);
                    });

                  resolve(resultList[0]);
                }
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Save User account
  * @param {string} useraccount_id
  * @return {object}
*/
Partnerbuyeruser.prototype.createMultiple = () => new BluePromise((resolve, reject) => {
  let str = [];
  str = that.model;
  _.forEach(str, (key) => {
    const id = key.useraccount_id;
    that.getById(id, 'useraccount_id')
      .then((results) => {
        log.info(results.length);
        if (results.length === 0 && id !== undefined) {
          const query = that.sqlTable.insert(key).toQuery();
          that.dbConn.queryAsync(query.text, query.values)
            .then((response) => {
              that.getById(id)
                .then((resultList) => {
                  if (!resultList[0].id) {
                    reject('Not Found');
                  } else {
                    new Mailer(that.mailConfirmation(resultList[0])).send()
                      .then(() => {
                        log.info(`Successfully registered with e-mail ${resultList[0].email}`);
                      })
                      .catch((err) => {
                        log.error(`Failed to send ${err}`);
                      });

                    resolve(resultList[0]);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
              return response;
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject('Found');
        }
      });
  });
  resolve();
});

Partnerbuyeruser.prototype.mailConfirmation = (userAccount) => {
  const hostname = config.env.hostname === 'localhost' ? `${config.env.hostname}:${config.env.port}` : config.env.hostname;
  const body = `
  <div><p>Hi,</p></div>
  <div><p>You have successfully registered with username ${userAccount.email}</p></div>
  <div><p>Please confirm your registration by clicking this link below</p></div>
  <div><p><a href="https://${hostname}">lkasdjfkladsjflkdsajflkasdjflkajsdlkfadfs</a></p></div>
  <div><p>Thank you!</p></div>
  `;
  return {
    from: 'info@eos.com.ph',
    to: userAccount.email,
    subject: 'OMG - Successful registration',
    text: `Successfully registered with e-mail ${userAccount.email}`,
    html: body,
  };
};

Partnerbuyeruser.prototype.sendPasswordEmails = () => new BluePromise((resolve, reject) => {
  that.findAll(0, 5000, {
    forcedReset: 1,
  })
    .then((resultList) => {
      if (resultList.length > 0) {
        _.forEach(resultList, (obj) => {
          new Token({
            dateExpiration: parseInt(moment().add(1, 'days').format('x'), 10),
            type: 'PASSWORD_RESET',
          }).create(obj.useraccount_id, 'USER')
            .then(() => {
              new Token({}).findAll(0, 1, {
                accountId: obj.useraccount_id,
                accountType: 'USER',
              })
                .then((result) => {
                  new Mailer(that.passwordResetEmail(_.merge(obj, { token: result[0].key }))).send()
                    .then(() => {
                      log.info(`Successfully sent password reset email to ${obj.email} for user ${obj.partnerBuyerUser_id}`);
                      new User({ forcedReset: 0 }).update(obj.useraccount_id)
                        .then(() => {
                          log.info('User forcedReset field set to 0');
                        })
                        .catch((err) => {
                          log.error(`Failed to update ${err}`);
                        });
                    })
                    .catch((err) => {
                      // TODO: update valid in useracounttoken to 0
                      log.error(`Failed to send ${err}`);
                    });
                })
                .catch(() => {
                  reject('Not Found');
                });
            })
            .catch(() => {
              reject('Not Found');
            });
        });
        resolve();
      } else {
        reject('Not Found');
      }
    })
    .catch(() => {
      reject('Not Found');
    });
});

Partnerbuyeruser.prototype.passwordResetEmail = (userAccount) => {
  const hostname = config.env.hostname === 'localhost' ? `${config.env.hostname}:${config.env.port}` : config.env.hostname;
  const body = `
  <div><p>Hi ${userAccount.firstName},</p></div>
  <div><p>You have successfully registered to <b>Oh My Grocery</b> with username ${userAccount.email}</p></div>
  <div><p>Please confirm your registration by clicking this link below:</p></div>
  <div><p><a href="https://${hostname}/user/guestActivation?token=${userAccount.token}&email=${userAccount.email}&i=${userAccount.useraccount_id}">${userAccount.token}</a></p></div>
  <div><p>Thank you!</p></div>
  `;
  return {
    from: 'info@eos.com.ph',
    to: userAccount.email,
    subject: 'OMG - Successful registration',
    text: `Successfully registered with e-mail ${userAccount.email}`,
    html: body,
  };
};

Partnerbuyeruser.prototype.update = id => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getByValue(id, 'useraccount_id')
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Foundssss');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(resultList[0].id)).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.message);
          })
          .catch((err) => {
            log.info(err);
            reject(err);
          });
      }
    })
    .catch((err) => {
      log.info(err);
      reject(err);
    });
});

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Partnerbuyeruser.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};


/**
  * Get userAccount by id
  * @param {integer} id
  * @return {object<Promise>}
*/
// User.prototype.getById = id => that.dbConn.readAsync(id);
Partnerbuyeruser.prototype.findById = id => that.getByValue(id, 'id');
Partnerbuyeruser.prototype.getById = id => that.getByValue(id, 'id');


/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Partnerbuyeruser.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.username && filters.password) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.username.equals(filters.username)
        .and(that.sqlTable.password.equals(filters.password)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.partnerId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.partner_id.equals(filters.partnerId))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.forcedReset) {
    query = that.sqlTable
      .select(that.sqlTable.id.as('partnerBuyerUser_id'), that.sqlTable.star(), that.sqlTableUser.star())
      .from(that.sqlTable.join(that.sqlTableUser)
        .on(that.sqlTable.useraccount_id.equals(that.sqlTableUser.id)))
      .where(that.sqlTableUser.forcedReset.equals(filters.forcedReset))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }
  log.info(query.text);

  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Format response object and/or append additional object properties
  * @param {object} object
  * @param {object} properties
  * @return {object}
*/
Partnerbuyeruser.prototype.cleanResponse = (object, properties) => {
  // eslint-disable-next-line
  delete object.password;
  _.merge(object, properties);

  return object;
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Partnerbuyeruser.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Partnerbuyeruser;
