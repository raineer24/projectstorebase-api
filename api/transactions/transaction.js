const BluePromise = require('bluebird');
const _ = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');
// const random = require('randomstring');

let that;


/**
  * generate
  * @return {string}
*/
function generate() {
  return Math.floor((Math.random() * 1000) + 1000) + new Date().getTime() +
    Math.floor((Math.random() * 100) + 100);
}

/**
  * Constructor
  * @param {object} transaction
  * @return {object}
*/
function Transaction(transaction) {
  this.model = _.extend(transaction, {
    comments: transaction.comments || '',
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'transaction';
  this.transactionId = generate();
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * get transaction number
  * @return {string}
*/
Transaction.prototype.getTransaction = () => that.transactionId;

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
    .then(() => {
      resolve(that.model.number);
    })
    .catch((err) => {
      reject(err);
    });
});

module.exports = Transaction;
