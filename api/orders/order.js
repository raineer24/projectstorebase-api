const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Order');


const Conn = require('../../service/connection');
const Mailer = require('../../service/mail');
const Timeslotorder = require('../timeslotorders/timeslotorder');
const Transaction = require('../transactions/transaction');
const OrderItem = require('../orderItems/orderItem');
const Orderseller = require('../ordersellers/orderseller');
const Gc = require('../gc/gc');

let that;

/**
  * Order constructor
  * @param {object} order
  * @return {object}
*/
function Order(order) {
  sql.setDialect('mysql');

  this.model = _.extend(order, {
    number: 0,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'order';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
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
      'seller_id',
    ],
  });
  this.sqlTableOrderSeller = sql.define({
    name: 'orderseller',
    columns: [
      'id',
      'orderNumber',
      'orderBarCode',
      'dateCreated',
      'dateCompleted',
      'orderslip_printedby',
      'assembly_personnel',
      'checkedBy',
      'item_List',
      'total_Items',
      'dateUpdated',
      'seller_id',
      'order_id',
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

Order.prototype.setTransactionNumber = (number) => {
  that.model = _.merge(that.model, {
    number,
  });
};

/**
  * create
  * @return {object/number}
*/
Order.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.orderkey, 'orderkey')
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.insertId);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(that.model.orderkey);
      }
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
Order.prototype.findAll = (skip, limit, filters, sortBy, sort) => {
  let query = null;
  let sortString = `${that.table}.dateUpdated DESC`;
  if (sortBy) {
    sortString = `${sortBy === 'date' ? 'dateUpdated' : 'status'} ${sort}`;
  }

  if (filters.useraccountId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.useraccount_id.equals(filters.useraccountId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.sellerId) {
    query = that.sqlTable
      .select(that.sqlTable.id.as('order_id'), that.sqlTable.star(), that.sqlTableUser.star(), that.sqlTableOrderSeller.star())
      .from(that.sqlTable
        .leftJoin(that.sqlTableUser)
        .on(that.sqlTableUser.id.equals(that.sqlTable.useraccount_id))
        .leftJoin(that.sqlTableOrderSeller)
        .on(that.sqlTableOrderSeller.order_id.equals(that.sqlTable.id)))
      .where(that.sqlTable.seller_id.equals(filters.sellerId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
    log.info(query);
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }
  log.info(query.text);
  log.info('findall');
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Order.prototype.findById = id => that.getByValue(id, 'id');
Order.prototype.getById = id => that.getByValue(id, 'id');

/**
  * update
  * @return {object/number}
*/
Order.prototype.update = (id, confirmOrder) => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(confirmOrder ? id : response.message);
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

Order.prototype.updateByOrderkey = orderkey => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.getByValue(orderkey, 'orderkey')
    .then((resultList) => {
      if (resultList.length === 0) {
        reject('Not found');
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
});

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Order.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

Order.prototype.processOrder = (id, gcList) => new BluePromise((resolve, reject) => {
  const instTrans = new Transaction({});
  const transactionId = instTrans.getTransaction();
  const instGc = new Gc({});
  let transType = '';
  if (gcList) {
    for (let ctr = 0; ctr < gcList.length; ctr += 1) {
      instGc.getByValue(gcList[ctr], 'code').then((resultList) => {
        if (resultList[0].status !== 'unused') {
          reject(`Cannot complete order. GC ${gcList[ctr]} is not available!`);
        }
      });
    }
    transType = 'GIFTCERT_PAYMENT';
  } else {
    transType = 'ORDER';
  }
  that.setTransactionNumber(transactionId);
  that.update(id, true) // update(order_id, confirmOrder)
    .then(new Timeslotorder({ confirmed: 1 }).confirmOrder) // Update timeslotorder
    .then(new Transaction({
      order_id: id,
      number: transactionId,
      action: 'CONFIRM_ORDER',
      type: transType,
    }).create) // Create transaction
    .then(() => {
      that.getById(id)
        .then((resultList) => {
          if (resultList.length > 0) {
            const orderEntry = resultList[0];
            log.info(orderEntry);
            that.mailConfirmation(_.merge(orderEntry, { transactionId }))
              .then((mailOptions) => {
                new Mailer(mailOptions).send()
                  .then(() => {
                    log.info(`Successfully sent order with transaction # ${transactionId}`);
                  })
                  .catch((err) => {
                    log.error(`Failed to send ${err}`);
                  });
              })
              .catch(() => {});
            new Orderseller({
              order_id: orderEntry.id,
              seller_id: orderEntry.seller_id,
              orderNumber: orderEntry.number,
            }).create();
            resolve(transactionId);
          } else {
            reject('Order not found');
          }
        })
        .catch((err) => {
          reject(err);
        });
    })
    .catch((err) => {
      reject(err);
    });
  // Create notification
});


Order.prototype.mailConfirmation = orderEntry => new BluePromise((resolve, reject) => {
  new OrderItem({}).findAll(0, 1000, {
    orderkey: orderEntry.orderkey,
  })
    .then((resultList) => {
      let body = `
      <div><p>Hi,</p></div>
      <div><p>You have successfully confirmed and paid for your order</p></div>
      <div><b>Transaction # ${orderEntry.transactionId}</b></div>
      <h2>Shopping summary</h2>
      `;
      _.forEach(resultList, (obj) => {
        body += `<div>${obj.name} &nbsp; (${obj.displayPrice} x ${obj.quantity})</div>`;
      });
      body += `<h1>Total: PHP ${orderEntry.total}</h1>`;
      resolve({
        from: 'info@eos.com.ph',
        bcc: 'raineerdelarita@gmail.com',
        to: orderEntry.email,
        subject: `OMG - Order confirmation ${orderEntry.transactionId}`,
        text: `Successfully paid and confirmed order # ${orderEntry.transactionId}`,
        html: body,
      });
    })
    .catch((err) => {
      reject(err);
    });
});
Order.prototype.mailAuditConfirmation = orderEntry => new BluePromise((resolve, reject) => {
  new OrderItem({}).findAll(0, 1000, {
    orderkey: orderEntry.orderkey,
  })
    .then((resultList) => {
      let body = `
      <div><p>Email Notification - User and Audit Personnel</p></div>
      <div><p>Send emails to user and audit personnel upon confirmation of order</p></div>
      <div><b>Transaction # ${orderEntry.transactionId}</b></div>
      <h2>Trigger is the Place Order Now button in Payment page</h2>
      `;
      _.forEach(resultList, (obj) => {
        body += `<div>${obj.name} &nbsp; (${obj.displayPrice} x ${obj.quantity})</div>`;
      });
      body += `<h1>Total: PHP ${orderEntry.total}</h1>`;
      resolve({
        from: 'info@eos.com.ph',
        bcc: 'raineerdelarita@gmail.com',
        to: orderEntry.email,
        subject: `Email Notification - User and Audit Personnel ${orderEntry.transactionId}`,
        text: `Email Notification - User and Audit Personnel # ${orderEntry.transactionId}`,
        html: body,
      });
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
Order.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Order;
