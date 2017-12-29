const BluePromise = require('bluebird');
const lodash = require('lodash');
const Conn = require('../../service/connection');

let that;

/**
  * Item constructor
  * @param {object} item
  * @return {object}
*/
function Log(log) {
  this.model = lodash.extend(log, {
    dateCreated: new Date().getTime(),
  });
  this.table = 'log';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

Log.prototype.create = () => new BluePromise((resolve, reject) => {
  const DbModel = Conn.extend({ tableName: that.table });
  that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
  that.dbConn.saveAsync()
    .then((response) => {
      resolve(response.insertId);
    })
    .catch((err) => {
      reject(err);
    });
});

module.exports = Log;
