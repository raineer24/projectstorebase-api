const BluePromise = require('bluebird');
const _ = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');

let that;

/**
  * Constructor
  * @param {object} transaction
  * @return {object}
*/
function Transaction(transaction) {
  this.model = _.extend(transaction, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'transaction';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}
/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Transaction.prototype.findAll = (offset, limit, filters) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'range'], filters, limit, offset));

/**
  * create
  * @return {object/number}
*/
Transaction.prototype.create = () => new BluePromise((resolve, reject) => {
  if (that.model.id) {
    delete that.model.id;
  }
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

module.exports = Transaction;
