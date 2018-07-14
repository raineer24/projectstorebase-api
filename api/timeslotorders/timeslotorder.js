const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const moment = require('moment');
const log = require('color-logs')(true, true, 'Timeslotorder');

const Timeslot = require('../timeslots/timeslot');
const Conn = require('../../service/connection');

let that;

/**
  * Constructor
  * @param {object} timeslotorder
  * @return {object}
*/
function TimeslotOrder(timeslotorder) {
  sql.setDialect('mysql');

  this.model = _.extend(timeslotorder, {
    // datetime: new Date(timeslotorder.date).getTime(),
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'timeslotorder';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'dateCreated',
      'dateUpdated',
      'date',
      'datetime',
      'confirmed',
      'timeslot_id',
      'order_id',
    ],
  });

  that = this;
}

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

/**
  * create
  * @return {object/number}
*/
TimeslotOrder.prototype.create = () => new BluePromise((resolve, reject) => {
  // const date = new Date(that.model.datetime);
  // date.setHours(5 + (that.model.timeslot_id * 3));
  // that.model.datetime = date.getTime();
  that.findAll(0, 1, {
    orderId: that.model.order_id,
    timeslotId: that.model.timeslot_id,
  })
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const dMax = getMax(moment(that.model.date).utcOffset(8).format('ddd'));
        new Timeslot({}).getById(that.model.timeslot_id)
          .then((timeslotResultList) => {
            if (timeslotResultList.length === 0) {
              reject('Not Found');
            } else {
              that.findAll(0, 100, {
                timeslotId: that.model.timeslot_id,
                date: that.model.date,
                confirmed: 1,
              })
                .then((tsoResultList) => {
                  if (tsoResultList.length >= timeslotResultList[0][dMax]) {
                    reject('Full');
                  } else {
                    const query = that.sqlTable.insert(that.model).toQuery();
                    that.dbConn.queryAsync(query.text, query.values)
                      .then((response) => {
                        resolve(response.insertId);
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
      } else {
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

TimeslotOrder.prototype.updateTimeslotOrder = orderId => new BluePromise((resolve, reject) => {
  const date = new Date(that.model.datetime);
  date.setHours(5 + (that.model.timeslot_id * 3));
  that.model.datetime = date.getTime();
  that.model.dateUpdated = new Date().getTime();
  that.findAll(0, 1, {
    orderId,
    timeslot_id: that.model.timeslot_id,
  })
    .then((resultList) => {
      if (resultList.length === 0) {
        reject('Not Found');
      } else {
        const dMax = getMax(moment(that.model.date).utcOffset(8).format('ddd'));
        new Timeslot({}).getById(that.model.timeslot_id)
          .then((timeslotResultList) => {
            if (timeslotResultList.length === 0) {
              reject('Not Found');
            } else {
              that.findAll(0, 100, {
                timeslotId: that.model.timeslot_id,
                date: that.model.date,
                confirmed: 1,
              })
                .then((tsoResultList) => {
                  if (tsoResultList.length >= timeslotResultList[0][dMax]) {
                    reject('Full');
                  } else {
                    that.model = _.merge(resultList[0], that.model);
                    const query = that.sqlTable.update(that.model)
                      .where(that.sqlTable.id.equals(resultList[0].id)).toQuery();
                    that.dbConn.queryAsync(query.text, query.values)
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
            }
          })
          .catch(() => {
            reject('Not Found');
          });
      }
    })
    .catch(() => {
      reject('Not Found');
    });
});

function formatWithRange(tsoResult) {
  const obj = {};
  tsoResult.forEach((row) => {
    if (!obj[`${row.date}-${row.timeslot_id}`]) {
      obj[`${row.date}-${row.timeslot_id}`] = 0;
    }
    obj[`${row.date}-${row.timeslot_id}`] = obj[`${row.date}-${row.timeslot_id}`] + 1;
  });
  return obj;
}

TimeslotOrder.prototype.formatTimeslots = tsoResult => new BluePromise((resolve, reject) => {
  const formatted = [];
  const bookedSlots = formatWithRange(tsoResult);

  new Timeslot({}).findAll(0, 100, {})
    .then((results) => {
      /*eslint-disable */
      for (let n = 0; n < 7; n++) {
        const currDate = moment().add(n, 'days').utcOffset(8).format('YYYY-MM-DD');
        const maxValue = getMax(moment().add(n, 'days').utcOffset(8).format('ddd'));
        formatted.push({
          date: currDate,
          range: [],
        });
        results.forEach((tsValue) => {
          // console.log(tsValue);
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
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
TimeslotOrder.prototype.findById = id => that.getByValue(id, 'id');
TimeslotOrder.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
TimeslotOrder.prototype.getByValue = (value, field) => {
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
TimeslotOrder.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.orderId && filters.timeslotId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.order_id.equals(filters.orderId)
        .and(that.sqlTable.timeslot_id.equals(filters.timeslotId)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.timeslotId && filters.date) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.date.equals(filters.date)
        .and(that.sqlTable.timeslot_id.equals(filters.timeslotId))
        .and(that.sqlTable.confirmed.equals('1')))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.current) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      // .where(that.sqlTable.date.equals(filters.current))
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
  * confirmOrder
  * @param {int} orderId
  * @return {order_id}
*/
TimeslotOrder.prototype.confirmOrder = (orderId) => new BluePromise((resolve, reject) => {
  // TODO: get the timeslotorder record
  that.getByValue(orderId, 'order_id')
    .then((resultSet) => {
      if (resultSet.length === 0) {
        reject('Not Found');
      } else {
        delete that.model.datetime;
        // that.model = _.merge(resultSet[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.order_id.equals(orderId)).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(orderId);
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
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
TimeslotOrder.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = TimeslotOrder;
