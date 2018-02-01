const BluePromise = require('bluebird');
const _ = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');
const Timeslot = require('../timeslots/timeslot');
const moment = require('moment');

let that;

/**
  * Constructor
  * @param {object} timeslotorder
  * @return {object}
*/
function TimeslotOrder(timeslotorder) {
  this.model = _.extend(timeslotorder, {
    datetime: new Date(timeslotorder.date).getTime(),
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'timeslotorder';
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

function getMax(day) {
  let max = 'd7max';
  switch (day) {
    case 'Mon':
      max = 'd1max';
      break;
    case 'Tue':
      max = 'd2max';
      break;
    case 'Wed':
      max = 'd3max';
      break;
    case 'Thu':
      max = 'd4max';
      break;
    case 'Fri':
      max = 'd5max';
      break;
    case 'Sat':
      max = 'd6max';
      break;
    default:
      break;
  }
  return max;
}

function formatWithRange(tsoResult) {
  const obj = {};
  tsoResult.forEach((row) => {
    if (!obj[`${row.date}-${row.id}`]) {
      obj[`${row.date}-${row.id}`] = 0;
    }
    obj[`${row.date}-${row.id}`] = obj[`${row.date}-${row.id}`] + 1;
  });
  return obj;
}

TimeslotOrder.prototype.formatTimeslots = tsoResult => new BluePromise((resolve, reject) => {
  const formatted = [];
  const bookedSlots = formatWithRange(tsoResult);

  new Timeslot({}).findAll(0, 100, {})
    .then((results) => {
      /*eslint-disable */
      for (let n = 0; n <= 7; n++) {
        const currDate = moment().add(n, 'days').format('YYYY-MM-DD');
        const maxValue = getMax(moment().add(n, 'days').format('ddd'));
        formatted.push({
          date: currDate,
          range: [],
        });
        results.forEach((tsValue) => {
          // const tmax = tsValue[maxValue];
          formatted[n].range.push({
            range: tsValue.range,
            timeslotId: tsValue.id,
            booked: bookedSlots[`${currDate}-${tsValue.id}`] ? bookedSlots[`${currDate}-${tsValue.id}`] : 0,
            max: tsValue[maxValue],
          });
        });
      }
      resolve(formatted);
    })
    .catch(() => {
      reject([]);
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

/**
  * confirmOrder
  * @param {int} orderId
  * @return {order_id}
*/
TimeslotOrder.prototype.confirmOrder = (orderId) => new BluePromise((resolve, reject) => {
  const DbModel = Conn.extend({ tableName: that.table });
  that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
  that.dbConn.saveAsync(`order_id = '${orderId}'`)
    .then((response) => {
      resolve(orderId);
    })
    .catch((err) => {
      resolve(err);
    });
});

module.exports = TimeslotOrder;
