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
function Timeslot(timeslot) {
  this.model = _.extend(timeslot, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'timeslot';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}
/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Timeslot.prototype.findAll = (offset, limit, filters) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'range'], filters, limit, offset));

module.exports = Timeslot;
