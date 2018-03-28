const BluePromise = require('bluebird');
const Conn = require('../../service/connection');
// const Util = require('../helpers/util');
const lodash = require('lodash');

let that;

/**
  * Selleracct constructor
  * @param {object} selleraccount
  * @return {object}
*/

function Selleracct(selleraccount) {
  this.model = lodash.extend(selleraccount, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'selleraccount';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * Save Seller account
  * @return {object}
*/
Selleracct.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.username, 'username')
    .then((results) => {
      if (results.length === 0) {
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.dbConn.saveAsync()
          .then((response) => {
            resolve(response.insertId);
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
  * Update Seller account
  * @return {object}
*/
Selleracct.prototype.update = id => new BluePromise((resolve, reject) => {
  delete that.model.username;
  if (!that.model.password || !that.model.newPassword) {
    delete that.model.password;
  } else {
    delete that.model.newPassword;
  }
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.model = lodash.merge(results, that.model);
        that.dbConn.setAsync('id', id);
        that.dbConn.saveAsync()
          .then((response) => {
            resolve(response.message);
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
  * Get sellerAccount by id
  * @param {integer} id
  * @return {object<Promise>}
*/
Selleracct.prototype.getById = id => that.dbConn.readAsync(id);


/**
  * Get sellerAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Selleracct.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${field} = '${value}'` });

Selleracct.cleanResponse = (object, properties) => {
  // eslint-disable-next-line
  delete object.password;
  lodash.merge(object, properties);

  return object;
};


module.exports = Selleracct;
