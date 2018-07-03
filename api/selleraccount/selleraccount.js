const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Seller Account');
const moment = require('moment');
const config = require('../../config/config');

const Conn = require('../../service/connection');
const Util = require('../helpers/util');
const Mailer = require('../../service/mail');
const Token = require('../token/token');

let that;

let tokenContainer;

/**
  * Selleraccount constructor
  * @param {object} selleraccount
  * @return {object}
*/

function Selleraccount(selleraccount) {
  sql.setDialect('mysql');

  this.model = _.extend(selleraccount, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'selleraccount';
  this.dbConn = Conn;

  this.sqlTable = sql.define({
    name: 'selleraccount',
    columns: [
      'id',
      'username',
      'password',
      'email',
      'name',
      'enabled',
      'seller_id',
      'role_id',
      'lastLogin',
      'dateCreated',
      'dateUpdated',
    ],
  });
  this.sqlTableRole = sql.define({
    name: 'role',
    columns: [
      'id',
      'name',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

/**
  * Save Seller account
  * @return {object}
*/
Selleraccount.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.username, 'username')
    .then((results) => {
      if (results.length === 0) {
        that.getByValue(that.model.email, 'email')
          .then((resultsEmail) => {
            if (resultsEmail.length === 0) {
              if (that.model.id) {
                delete that.model.id;
              }
              that.model.password = Math.random().toString(36).slice(2);
              // that.model.password = 'password';
              const query = that.sqlTable.insert(that.model).toQuery();
              that.dbConn.queryAsync(query.text, query.values)
                .then((response) => {
                  resolve(response.insertId);
                })
                .catch((err) => {
                  reject(err);
                });
            } else {
              reject('Email Found');
            }
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject('Username Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Update Seller account
  * @return {object}
*/
Selleraccount.prototype.update = id => new BluePromise((resolve, reject) => {
  const isInvalidate = that.model.newPassword;
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
                  if (isInvalidate) {
                    new Token().invalidate(id, 'PARTNER_USER')
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
    .catch((err) => {
      reject(err);
    });
});


/**
  * Reset Password
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Selleraccount.prototype.resetPassword = email => new BluePromise((resolve, reject) => {
  that.getByValue(email, 'email')
    .then((resultList) => {
      if (resultList[0].id) {
        new Token().invalidate(resultList[0].id, 'PARTNER_USER');
        new Token({
          dateExpiration: parseInt(moment().add(1, 'days').format('x'), 10),
          type: 'PASSWORD_RESET',
        }).create(resultList[0].id, 'PARTNER_USER')
          .then((tokenId) => {
            new Token({}).findAll(0, 1, {
              accountId: resultList[0].id,
              accountType: 'PARTNER_USER',
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
                  reject('Not found');
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
        reject('Not found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Password Reset Email
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Selleraccount.prototype.passwordResetEmail = (user) => {
  const hostname = config.env.hostname === 'localhost' ? `${config.env.hostname}:${config.env.port}` : config.env.hostname;
  const body = `
  <div><p>Hi ${user.name},</p></div>
  <div><p>Your <b>OMG!</b> Dashboard password has been reset.</p></div>
  <div><p>Please create a new password by clicking on this link within the next 24 hours:
  <a href="https://${hostname}/admin/resetPassword?token=${user.token}&email=${user.email}&i=${user.id}">Click here</a>
  </p></div>
  <div><p>Please remember to keep your username and password confidential at all times.</p></div>
  <div><p>Thank you!</p></div>
  `;
  return {
    from: 'info@eos.com.ph',
    to: user.email,
    subject: 'OMG - Account Password Reset',
    text: `Password reset request for e-mail ${user.email}`,
    html: body,
  };
};

/**
  * User authentication of username and password
  * @param {string} username
  * @param {string} password
  * @return {object}
*/
Selleraccount.prototype.authenticate = () => new BluePromise((resolve, reject) => {
  const filter = {
    username: that.model.username,
  };

  if (that.model.password) {
    filter.password = that.model.password;
  }

  that.findAll(0, 1, filter)
    .then((results) => {
      if (results.length === 0) {
        reject('Not found');
        return;
      } else if (!results[0].enabled) {
        reject('Disabled');
        return;
      }
      tokenContainer = Util.signSellerToken(results[0]);
      resolve(_.merge({
        authenticated: true,
        token: tokenContainer,
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
Selleraccount.prototype.authorize = userAuth => new BluePromise((resolve, reject) => {
  if (!userAuth) {
    reject(null);
    return;
  }
  resolve(_.merge({
    authorize: true,
    // authorize: Util.decodeToken(tokenContainer),
    // roles: [
    //   'customer',
    //   'limited',
    // ],
    dateAuthenticated: userAuth.dateTime,
    dateAuthorized: new Date().getTime(),
  }, userAuth));
});
/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Selleraccount.prototype.findById = id => that.getByValue(id, 'id');
Selleraccount.prototype.getById = id => that.getByValue(id, 'id');


/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Selleraccount.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Selleraccount.prototype.findAll = (skip, limit, filters, sortBy, sort) => {
  let query = null;
  let sortString = `${that.table}.dateUpdated DESC`;
  if (sortBy) {
    sortString = `${sortBy === 'date' ? 'dateUpdated' : 'status'} ${sort}`;
  }
  if (filters.sellerId) {
    if (filters.count) {
      query = that.sqlTable
        .select(sql.functions.COUNT(that.sqlTable.id).as('count'))
        .from(that.sqlTable)
        .where(that.sqlTable.seller_id.equals(filters.sellerId))
        .toQuery();
    } else {
      query = that.sqlTable
        .select(that.sqlTable.star(), that.sqlTableRole.name.as('role'))
        .from(that.sqlTable
          .leftJoin(that.sqlTableRole)
          .on(that.sqlTableRole.id.equals(that.sqlTable.role_id)))
        .where(that.sqlTable.seller_id.equals(filters.sellerId))
        .order(sortString)
        .limit(limit)
        .offset(skip)
        .toQuery();
    }
  } else if (filters.username && filters.password) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.username.equals(filters.username)
        .and(that.sqlTable.password.equals(filters.password)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTableRole.name.as('role'))
      .from(that.sqlTable
        .join(that.sqlTableRole)
        .on(that.sqlTableRole.id.equals(that.sqlTable.role_id)))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }
  log.info(query.text);

  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Selleraccount.prototype.getRoles = () => {
  const strSql = 'SELECT * FROM role ORDER BY name;';

  return that.dbConn.queryAsync(strSql);
};

/**
  * Format response object and/or append additional object properties
  * @param {object} object
  * @param {object} properties
  * @return {object}
*/
Selleraccount.prototype.cleanResponse = (object, properties) => {
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
Selleraccount.prototype.release = () => that.dbConn.releaseConnectionAsync();


module.exports = Selleraccount;
