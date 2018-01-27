const BluePromise = require('bluebird');
const _ = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');

let that;

/**
  * Constructor
  * @param {object} timeslotOrder
  * @return {object}
*/
function TimeslotOrder(timeslotorder) {
  this.model = _.extend(timeslotorder, {
    number: 0,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'timeslotOrder';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * create
  * @return {object/number}
*/
TimeslotOrder.prototype.create = () => new BluePromise((resolve, reject) => {
  that.findAll(0, 1, {
    orderId: that.model.order_id,
    timeslotId: that.model.timeslot_id,
  })
    .then((results) => {
      if (results.length === 0) {
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
      } else {
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

TimeslotOrder.prototype.update = id => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((results) => {
      if (!results.id) {
        reject('Not Found');
      } else {
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.model = _.merge(results, that.model);
        that.dbConn.setAsync('id', id);
        that.dbConn.saveAsync()
          .then((response) => {
            resolve(response.message);
          })
          .catch((err) => {
            resolve(err);
          });
      }
    })
    .catch(() => {
      reject('Not Found');
    });
});

/**
  * Get record by id
  * @param {integer} id
  * @return {object<Promise>}
*/
TimeslotOrder.prototype.getById = id => that.dbConn.readAsync(id);

TimeslotOrder.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${that.table}.${field} = '${value}'` });

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
TimeslotOrder.prototype.findAll = (offset, limit, filters) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'order_id', 'timeslot_id'], filters, limit, offset));

module.exports = TimeslotOrder;
