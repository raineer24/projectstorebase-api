const BluePromise = require('bluebird');
const lodash = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');
// const Util = require('../helpers/util');


let that;

/**
  * Item constructor
  * @param {object} item
  * @return {object}
*/
function Item(item) {
  this.model = lodash.extend(item, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'item';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @param {object} condition
  * @return {object}
*/
Item.prototype.findAll = (offset, limit) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'name'], null, limit, offset));


module.exports = Item;
