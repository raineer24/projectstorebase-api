const BluePromise = require('bluebird');
// const Conn = require('../../service/connection');
const ConnNew = require('../../service/connectionnew');
const Util = require('../helpers/util');
const _ = require('lodash');
const sql = require('sql');

const log = require('color-logs')(true, true, __filename);

let that;

function User(user) {
  sql.setDialect('mysql');

  this.model = _.extend(user, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'useraccount';
  // this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));
  this.dbConnNew = ConnNew;
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
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

User.prototype.testConnection = () => new BluePromise((resolve, reject) => {
  if (that.dbConnNew) {
    resolve(that.dbConnNew);
    return;
  }
  reject('Not found');
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
        reject('Not found');
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
        that.dbConnNew.queryAsync(query.text, query.values)
          .then((response) => {
            that.getById(response.insertId)
              .then((resultList) => {
                if (!resultList[0].id) {
                  reject('Not found');
                } else {
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

User.prototype.update = id => new BluePromise((resolve, reject) => {
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
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.message);
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
User.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConnNew.queryAsync(query.text, query.values);
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

  return that.dbConnNew.queryAsync(query.text, query.values);
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
User.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = User;
