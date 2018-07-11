const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const moment = require('moment');
const config = require('../../config/config');

const Conn = require('../../service/connection');
const Util = require('../helpers/util');
const Mailer = require('../../service/mail');

const Token = require('../token/token');

// const Partnerbuyeruser = require('../partnerbuyeruser/partnerbuyeruser');

const log = require('color-logs')(true, true, 'User Account');

let that;

function User(user) {
  sql.setDialect('mysql');

  this.model = _.extend(user, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'useraccount';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
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
      'birthdate',
      'deactivated',
      'forcedReset',
      'dateCreated',
      'dateUpdated',
    ],
  });

  this.table = 'partnerbuyeruser';
  this.dbConn = Conn;
  this.sqlTablePBU = sql.define({
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

  that = this;
}

User.prototype.testConnection = () => new BluePromise((resolve, reject) => {
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
User.prototype.authenticate = () => new BluePromise((resolve, reject) => {
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
User.prototype.authorize = userAuth => new BluePromise((resolve, reject) => {
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
  * @param {string} username
  * @param {string} password
  * @param {string} email
  * @param {string} uiid
  * @return {object}
*/
User.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.username, 'username')
    .then((results) => {
      if (that.model.password === undefined) {
        that.model.password = '';
      }
      if (that.model.uiid === undefined) {
        that.model.uiid = '';
      }
      if (results.length === 0) {
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            that.getById(response.insertId)
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
User.prototype.createMultiple = users => new BluePromise((resolve, reject) => {
  log.info(users);
  _.forEach(users, (key) => {
    that.getByValue(key.user.username, 'username')
      .then((results) => {
        if (results.length === 0 && key.user.username !== undefined) {
          const query = that.sqlTable.insert(key.user).toQuery();
          that.dbConn.queryAsync(query.text, query.values)
            .then((response) => {
              log.info('[RESULTS - CREATE USER]');
              log.info(response);
              const arr = _.merge(key.pbu, { useraccount_id: response.insertId });
              const pbuquery = that.sqlTablePBU.insert(arr).toQuery();
              that.dbConn.queryAsync(pbuquery.text, pbuquery.values)
                .then(result => resolve(result))
                .catch((err) => {
                  log.info(err);
                });
            })
            .catch((err) => {
              log.info(err);
            });
        } else {
          reject('Found');
        }
      });
  });
  resolve();
});

User.prototype.mailConfirmation = (userAccount) => {
  const hostname = config.env.hostname === 'localhost' ? `${config.env.hostname}:${config.env.port}` : config.env.hostname;
  const body = `
  <div><p>Hi,</p></div>
  <div><p>You have successfully registered with username ${userAccount.email}</p></div>
  <div><p>Please confirm your registration by clicking this link below</p></div>
  <div><p><a href="http://${hostname}">lkasdjfkladsjflkdsajflkasdjflkajsdlkfadfs</a></p></div>
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

User.prototype.update = (id, isChangePassword = false) => new BluePromise((resolve, reject) => {
  delete that.model.username;
  if (!that.model.password || !that.model.newPassword) {
    delete that.model.password;
  } else {
    delete that.model.newPassword;
  }
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        that.getByValue(that.model.email, 'email')
          .then((resultEmail) => {
            if (resultEmail.length && resultEmail[0].id !== resultList[0].id) {
              reject('Email Found');
            } else {
              that.model = _.merge(resultList[0], that.model);
              const query = that.sqlTable.update(that.model)
                .where(that.sqlTable.id.equals(id)).toQuery();
              that.dbConn.queryAsync(query.text, query.values)
                .then((response) => {
                  if (isChangePassword) {
                    new Token().invalidate(id, 'USER')
                      .then(() => {
                        resolve(response.message);
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  } else {
                    resolve(response.message);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
    })
    .catch(() => {
      reject('Not Found');
    });
});

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
User.prototype.sendPasswordResetEmail = obj => new BluePromise((resolve, reject) => {
  that.getByValue(obj.email, 'email')
    .then((resultList) => {
      if (resultList[0].id) {
        new Token().invalidate(resultList[0].id, 'USER');
        new Token({
          dateExpiration: parseInt(moment().add(1, 'days').format('x'), 10),
          type: 'PASSWORD_RESET',
        }).create(resultList[0].id, 'USER')
          .then((tokenId) => {
            new Token({}).findAll(0, 1, {
              accountId: resultList[0].id,
              accountType: 'USER',
              tokenId,
            })
              .then((resultList2) => {
                if (resultList2.length > 0) {
                  new Mailer(that.passwordResetEmail(_.merge(resultList[0], {
                    token: resultList2[0].key,
                  }))).send()
                    .then(() => {
                      log.info(`Successfully sent password reset email to ${resultList[0].email}`);
                      resolve('Success');
                    })
                    .catch((err) => {
                      log.error(`Failed to send ${err}`);
                      reject(err);
                    });
                } else {
                  reject('Not Found');
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
        reject('Not Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
User.prototype.passwordResetEmail = (userAccount) => {
  const hostname = config.env.hostname === 'localhost' ? `${config.env.hostname}:${config.env.port}` : config.env.hostname;
  const body = `
  <div><p>Hi ${userAccount.firstName},</p></div>
  <div><p>Your <b>Oh My Grocery</b> password has been reset.</p></div>
  <div><p>Please provide a new password by clicking on this link within the next 24 hours:
  <a href="http://${hostname}/user/resetPassword?token=${userAccount.token}&email=${userAccount.email}&i=${userAccount.id}">Click here</a>
  </p></div>
  <div><p>Please remember to keep your username and password confidential at all times.</p></div>
  <div><p>Thank you!</p></div>
  `;
  return {
    from: 'info@eos.com.ph',
    to: userAccount.email,
    subject: 'OMG - Account Password Reset',
    text: `Password reset request for e-mail ${userAccount.email}`,
    html: body,
  };
};

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
User.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
User.prototype.getByValuePBU = (value, field) => {
  log.info('[getByValuePBU]');
  log.info(value);
  log.info(field);
  const query = that.sqlTablePBU
    .select(that.sqlTablePBU.star())
    .from(that.sqlTablePBU)
    .where(that.sqlTablePBU[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Get userAccount by id
  * @param {integer} id
  * @return {object<Promise>}
*/
// User.prototype.getById = id => that.dbConn.readAsync(id);
User.prototype.findById = id => that.getByValue(id, 'id');
User.prototype.getById = id => that.getByValue(id, 'id');


/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
User.prototype.findAll = (skip, limit, filters) => {
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
  } else if (filters.username && filters.uiid) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.username.equals(filters.username)
        .and(that.sqlTable.uiid.equals(filters.uiid)))
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
User.prototype.cleanResponse = (object, properties) => {
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
User.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = User;
