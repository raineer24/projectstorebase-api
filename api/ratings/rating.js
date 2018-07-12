const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');

const Conn = require('../../service/connection');
const log = require('color-logs')(true, true, 'Rating');
const Mailer = require('../../service/mail');
const OrderItem = require('../orderItems/orderItem');
const Order = require('../orders/order');

let that;

/**
  * Order constructor
  * @param {object} order
  * @return {object}
*/
function Rating(orderSeller) {
  sql.setDialect('mysql');

  this.model = _.extend(orderSeller, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'rating';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'starCount',
      'orderkey',
      'useraccount_id',
      'feedback',
      'feedbacktype',
      'dateCreated',
      'dateUpdated',
    ],
  });
  this.sqlTableOrder = sql.define({
    name: 'order',
    columns: [
      'id',
      'orderkey',
      'number',
      'itemTotal',
      'finalItemTotal',
      'total',
      'discount',
      'shipmentTotal',
      'adjustmentTotal',
      'paymentTotal',
      'discountTotal',
      'dateCompleted',
      'shipmentStatus',
      'paymentStatus',
      'status',
      'email',
      'specialInstructions',
      'includedTaxTotal',
      'additionalTaxTotal',
      'displayIncludedTaxTotal',
      'displayAdditionalTaxTotal',
      'taxTotal',
      'currency',
      'totalQuantity',
      'finalTotalQuantity',
      'firstname',
      'lastname',
      'phone',
      'landline',
      'billingAddress01',
      'billingAddress02',
      'billCity',
      'billPostalcode',
      'billCountry',
      'billCountry_id',
      'shippingAddress01',
      'shippingAddress02',
      'city',
      'postalcode',
      'country',
      'country_id',
      'paymentMode',
      'paymentInstructions',
      'dateCreated',
      'dateUpdated',
      'useraccount_id',
      'address_id',
      'referenceId',
      'partner_id',
    ],
  });
  this.sqlTableUser = sql.define({
    name: 'useraccount',
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

/**
  * create
  * @return {object/number}
*/
Rating.prototype.create = () => new BluePromise((resolve, reject) => {
  const query = that.sqlTable.insert(that.model).toQuery();
  log.info(query);
  that.dbConn.queryAsync(query.text, query.values)
    .then((response) => {
      that.getById(response.insertId)
        .then((resultList) => {
          const ratingEntry = resultList[0];
          if (!resultList[0].id) {
            reject('Not Found');
          } else {
            new Order({}).getByValue(ratingEntry.orderkey, 'orderkey')
              .then((orderResults) => {
                if (orderResults.length !== 0) {
                  new Mailer(that.mailConfirmation(ratingEntry, orderResults[0])).send()
                    .then(() => {
                      log.info('ratingEntry1');
                      log.info(ratingEntry);
                      log.info('sent!');
                    })
                    .catch((err) => {
                      log.error(`Failed to send 1 ${err}`);
                    });
                }
              })
              .catch((err) => {
                log.error(`Not Found ${err}`);
              });
          }
        });
      resolve(response.insertId);
      // log.info(`Result: ${response.insertId}`);
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Rating.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.Id && filters.orderkey) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.id.equals(filters.Id)
        .and(that.sqlTable.orderkey.equals(filters.orderkey)))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.orderkey) {
    query = that.sqlTable
      .select(that.sqlTable.id.as('Id'), that.sqlTable.star(), that.sqlTableOrder.star())
      .from(that.sqlTable.join(that.sqlTableOrder)
        .on(that.sqlTable.id.equals(that.sqlTableOrder.id)))
      .where(that.sqlTable.orderkey.equals(filters.orderkey))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.accountId) {
    query = that.sqlTable
      .select(that.sqlTable.id.as('Id'), that.sqlTable.star(), that.sqlTableItem.star())
      .from(that.sqlTable.join(that.sqlTableOrder)
        .on(that.sqlTable.id.equals(that.sqlTableOrder.id)))
      .where(that.sqlTable.useraccount_id.equals(filters.accountId))
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

Rating.prototype.mailConfirmation = (ratingEntry, order) => {
  const body = `
  <div><p>Hi,</p></div>
  <div></p></div>
  <div><p>Please confirm your registration by clicking this link below</p></div>
  <div>/p></div>
  <div><p>Thank you!</p></div>
  `;
  return {
    from: 'info@eos.com.ph',
    to: order.email,
    subject: 'OMG - Feedback',
    text: `Omg feedback e-mail ${order.email}`,
    html: body,
  };
};

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Rating.prototype.findById = id => that.getByValue(id, 'id');
Rating.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Rating.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Rating.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Rating;
