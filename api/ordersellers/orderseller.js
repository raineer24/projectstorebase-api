const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const log = require('color-logs')(true, true, 'Order Seller');
const Mailer = require('../../service/mail');
const Conn = require('../../service/connection');
const OrderStatusLogs = require('../orderstatuslogs/orderstatuslogs');
const OrderItem = require('../orderItems/orderItem');
const Order = require('../orders/order');

let that;

/**
  * Order constructor
  * @param {object} order
  * @return {object}
*/
function OrderSeller(orderSeller) {
  sql.setDialect('mysql');

  this.model = _.extend(orderSeller, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'orderseller';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'orderNumber', // Generate
      'orderBarcode',
      'status',
      'assembledBy',
      'deliveredBy',
      'updatedBy',
      'itemList',
      'totalItems',
      'comments',
      'order_id',
      'selleraccount_id',
      'seller_id',
      'dateAssembled',
      'dateDelivered',
      'dateCompleted',
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
      'seller_id',
    ],
  });
  this.sqlTableSellerAccount = sql.define({
    name: 'selleraccount',
    columns: [
      'id',
      'username',
      'password',
      'email',
      'name',
      'seller_id',
      'role_id',
      'dateCreated',
      'dateUpdated',
    ],
  });
  this.sqlTableTimeslotOrder = sql.define({
    name: 'timeslotorder',
    columns: [
      'id',
      'order_id',
      'timeslot_id',
      'datetime',
      'date',
      'confirmed',
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
OrderSeller.prototype.create = () => new BluePromise((resolve, reject) => {
  that.findAll(0, 1, {
    orderId: that.model.order_id,
  })
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            new OrderStatusLogs({
              order_id: that.model.order_id,
              status: 'pending',
            }).create();
            resolve(response.insertId);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve('Existing');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * update
  * @return {object/number}
*/
OrderSeller.prototype.update = id => new BluePromise((resolve, reject) => {
  delete that.model.dateCreated;
  that.model.dateUpdated = new Date().getTime();
  if (that.model.status.toUpperCase() === 'IN-TRANSIT') {
    that.model.dateDelivered = new Date().getTime();
  }
  that.getById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        const orderSeller = that.model;
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            if (orderSeller.status === 'in-transit') {
              that.findAll(0, 1, { order_id: orderSeller.order_id, sendMail: true })
                .then((orderList) => {
                  if (orderList.length !== 0) {
                    new OrderItem({}).findAll(0, 1000, {
                      orderId: orderList[0].order_id,
                    })
                      .then((itemList) => {
                        if (itemList.length !== 0) {
                          log.info(itemList.length);
                          new Mailer(that.mailConfirmation(orderList[0], itemList)).send()
                            .then(() => {
                              log.info(orderList);
                              log.info('resultList[0]');
                              log.info(resultList[0]);
                              log.info('sent! Email in-transit checked orders confirmation');
                              log.info(that.model);
                            })
                            .catch((err) => {
                              log.info(`Failed to send  ${err}`);
                            });
                        }
                      });
                  }
                })
                .catch((err) => {
                  log.error(`Failed to send 1 ${err}`);
                });
            }
            if (orderSeller.status === 'complete') {
              that.findAll(0, 1, { order_id: orderSeller.order_id, sendMail: true })
                .then((orderList) => {
                  if (orderList.length !== 0) {
                    new OrderItem({}).findAll(0, 1000, {
                      orderId: orderList[0].order_id,
                    })
                      .then((itemList) => {
                        if (itemList.length !== 0) {
                          log.info(itemList.length);
                          new Mailer(that.mailCompletedConfirmation(orderList[0], itemList)).send()
                            .then(() => {
                              log.info(orderList);
                              log.info('resultList[0]');
                              log.info(resultList[0]);
                              log.info('sent! Email Completed orders assembled confirmation');
                              log.info(that.model);
                            })
                            .catch((err) => {
                              log.info(`Failed to send  ${err}`);
                            });
                        }
                      });
                  }
                })
                .catch((err) => {
                  log.error(`Failed to send 1 ${err}`);
                });
            }
            new OrderStatusLogs({
              order_id: that.model.order_id,
              status: that.model.status,
              handledBy: that.model.updatedBy,
            }).create();
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

OrderSeller.prototype.mailConfirmation = (orderSeller, itemList) => {
  const timeslots = ['', '8:00AM - 10:00AM', '11:00AM - 1:00PM', '2:00PM - 4:00PM', '5:00PM - 7:00PM', '8:00PM - 10:00PM'];
  let items = '';
  _.forEach(itemList, (item) => {
    log.info('item');
    log.info(item);
    items += `<div>${item.name}</div>`;
    items += `<div> <img src="https://s3-ap-southeast-2.amazonaws.com/grocerymegan62201/grocery/${item.imageKey}.jpg" style="margin:0 auto;float:none;max-width:50px;max-height:50px"/></div>`;
  });
  const body = `
  <div><p>Hi,</p></div>
  <div><p>In-transit delivery ${orderSeller.orderNumber}</p></div>
  <div>${timeslots[orderSeller.timeslot_id]}</div>
   <div>${orderSeller.date}</div>
  <div><p>Thank you!</p></div>
  ${items}
  `;
  return {
    from: 'info@eos.com.ph',
    bcc: 'raineerdelarita@gmail.com',
    to: 'nerboikun24@gmail.com',
    subject: `Delivered #${orderSeller.orderNumber} will be delivered now`,
    text: `Successfully In-transit delivery Assembled orders ${orderSeller.email}`,
    html: body,
  };
};
OrderSeller.prototype.mailCompletedConfirmation = (orderSeller, itemList) => {
  const timeslots = ['', '8:00AM - 10:00AM', '11:00AM - 1:00PM', '2:00PM - 4:00PM', '5:00PM - 7:00PM', '8:00PM - 10:00PM'];
  let items = '';
  _.forEach(itemList, (item) => {
    log.info('item');
    log.info(item);
    items += `<div>${item.name}</div>`;
    items += `<div> <img src="https://s3-ap-southeast-2.amazonaws.com/grocerymegan62201/grocery/${item.imageKey}.jpg" style="margin:0 auto;float:none;max-width:50px;max-height:50px"/></div>`;
  });
  const body = `
  <div><p>Completed,</p></div>
  <div><p>Completed ${orderSeller.orderNumber}</p></div>
  <div>${timeslots[orderSeller.timeslot_id]}</div>
   <div>${orderSeller.date}</div>
  <div><p>Thank you!</p></div>
  ${items}
  `;
  return {
    from: 'info@eos.com.ph',
    bcc: 'raineerdelarita@gmail.com',
    to: 'nerboikun24@gmail.com',
    subject: `Completed #${orderSeller.orderNumber} will be delivered now`,
    text: `Completed ${orderSeller.email}`,
    html: body,
  };
};
/**
  * update
  * @return {object/number}
*/
OrderSeller.prototype.takeOrder = (id, sellerAccountId) => new BluePromise((resolve, reject) => {
  delete that.model.dateCreated;
  that.model.dateUpdated = new Date().getTime();
  that.model.dateAssembled = new Date().getTime();
  that.findAll(0, 1, { takeOrder: true, selleraccount_id: sellerAccountId })
    .then((resList) => {
      if (resList.length) {
        reject('User Assigned');
      } else {
        that.getById(id)
          .then((resultList) => {
            if (!resultList[0].id) {
              reject('Not Found');
            } else {
              if (resultList[0].assembledBy) {
                reject('Already Taken');
              }
              that.model = _.merge(resultList[0], that.model);
              const query = that.sqlTable.update(that.model)
                .where(that.sqlTable.id.equals(id)).toQuery();
              that.dbConn.queryAsync(query.text, query.values)
                .then((response) => {
                  new OrderStatusLogs({
                    order_id: that.model.order_id,
                    status: that.model.status,
                    handledBy: that.model.updatedBy,
                  }).create();
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
    }).catch((err) => {
      reject(err);
    });
});

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderSeller.prototype.findAll = (skip, limit, filters, sortBy, sort) => {
  let query = null;
  let sortString = `${that.table}.dateUpdated DESC`;
  if (sortBy) {
    sortString = `${sortBy === 'date' ? 'dateUpdated' : 'id'} ${sort}`;
  }

  if (filters.orderId) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable
        .join(that.sqlTableOrder)
        .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id)))
      .where(that.sqlTable.order_id.equals(filters.orderId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.sellerId && filters.mode === 'orderlist') {
    let whereString = null;
    whereString = `${that.table}.seller_id = ${filters.sellerId}`;
    if (filters.orderStatus) {
      whereString += ` AND UPPER(${that.table}.status) = UPPER('${filters.orderStatus}')`;
    }
    if (filters.orderNumber) {
      whereString += ` AND ${that.table}.orderNumber = ${filters.orderNumber}`;
    }
    if (filters.orderDate) {
      const orderDates = filters.orderDate.split('|');
      whereString += ` AND (${that.table}.dateCreated BETWEEN ${orderDates[0]} AND ${orderDates[1]})`;
    }
    if (filters.deliverDate) {
      const deliverDates = filters.deliverDate.split('|');
      whereString += ` AND (timeslotorder.datetime BETWEEN ${deliverDates[0]} AND ${deliverDates[1]})`;
    }
    if (filters.timeslotId) {
      whereString += ` AND timeslotorder.timeslot_id = ${filters.timeslotId}`;
    }

    if (filters.count) {
      query = that.sqlTable
        .select(sql.functions.COUNT(that.sqlTable.id).as('count'))
        .from(that.sqlTable
          .join(that.sqlTableOrder)
          .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id)))
        .where(whereString)
        .toQuery();
    } else {
      query = that.sqlTable
        .select(that.sqlTableTimeslotOrder.star(), that.sqlTableOrder.id.as('order_id'), that.sqlTableOrder.star(), that.sqlTable.star())
        .from(that.sqlTable
          .join(that.sqlTableOrder)
          .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id))
          .leftJoin(that.sqlTableTimeslotOrder)
          .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.order_id)))
        .where(whereString)
        .order(sortString)
        .limit(limit)
        .offset(skip)
        .toQuery();
    }
  } else if (filters.sellerId && filters.mode === 'assembly') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    if (filters.orderStatus.toUpperCase() === 'ALL') {
      query = that.sqlTable
        .select(that.sqlTable.star(), that.sqlTableSellerAccount.name.as('sellerAccountName'), that.sqlTableTimeslotOrder.timeslot_id, that.sqlTableTimeslotOrder.datetime)
        .from(that.sqlTable
          .join(that.sqlTableOrder)
          .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id))
          .leftJoin(that.sqlTableSellerAccount)
          .on(that.sqlTableSellerAccount.id.equals(that.sqlTable.selleraccount_id))
          .leftJoin(that.sqlTableTimeslotOrder)
          .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.order_id)))
        .where(that.sqlTable.seller_id.equals(filters.sellerId))
        // .and(that.sqlTable.dateCreated.gte(today))
        .and(that.sqlTableTimeslotOrder.datetime.between(today, tomorrow))
        .order(sortString)
        .limit(limit)
        .offset(skip)
        .toQuery();
    } else {
      query = that.sqlTable
        .select(that.sqlTable.star(), that.sqlTableSellerAccount.name.as('sellerAccountName'), that.sqlTableTimeslotOrder.timeslot_id, that.sqlTableTimeslotOrder.datetime)
        .from(that.sqlTable
          .join(that.sqlTableOrder)
          .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id))
          .leftJoin(that.sqlTableSellerAccount)
          .on(that.sqlTableSellerAccount.id.equals(that.sqlTable.selleraccount_id))
          .leftJoin(that.sqlTableTimeslotOrder)
          .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.order_id)))
        .where(that.sqlTable.seller_id.equals(filters.sellerId))
        .and(sql.functions.UPPER(that.sqlTable.status).equals(filters.orderStatus.toUpperCase()))
        // .and(that.sqlTable.dateCreated.gte(today))
        .and(that.sqlTableTimeslotOrder.datetime.between(today, tomorrow))
        .order(sortString)
        .limit(limit)
        .offset(skip)
        .toQuery();
    }
  } else if (filters.sellerId) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTableSellerAccount.name.as('sellerAccountName'), that.sqlTableTimeslotOrder.timeslot_id)
      .from(that.sqlTable
        .join(that.sqlTableOrder)
        .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id))
        .leftJoin(that.sqlTableSellerAccount)
        .on(that.sqlTableSellerAccount.id.equals(that.sqlTable.selleraccount_id))
        .leftJoin(that.sqlTableTimeslotOrder)
        .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.order_id)))
      .where(that.sqlTable.seller_id.equals(filters.sellerId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.takeOrder) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.selleraccount_id.equals(filters.selleraccount_id)
        .and(that.sqlTable.dateAssembled.between(today, tomorrow)))
      .toQuery();
  } else if (filters.sendMail) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTableTimeslotOrder.timeslot_id, that.sqlTableTimeslotOrder.date, that.sqlTableOrder.star())
      .from(that.sqlTable
        .join(that.sqlTableOrder)
        .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id))
        .leftJoin(that.sqlTableTimeslotOrder)
        .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.order_id)))
      .where(that.sqlTable.order_id.equals(filters.order_id))
      .order(sortString)
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
  * itemCount
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderSeller.prototype.countFreshFrozen = (filters) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const strSql = `
    SELECT os.id, os.order_id, count(oi.id) AS itemCount
      FROM orderseller as os
      LEFT JOIN timeslotorder as tso ON tso.order_id = os.order_id
      LEFT JOIN orderitem as oi ON oi.order_id = os.order_id
      LEFT JOIN item as it ON it.id = oi.item_id
      WHERE it.category1 = 2 || it.category1 = 3
        AND os.seller_id = ${filters.sellerId}
        AND tso.datetime BETWEEN ${today} AND ${tomorrow}
      GROUP BY os.id;
  `;
  return that.dbConn.queryAsync(strSql);
};

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderSeller.prototype.findById = id => that.getByValue(id, 'id');
OrderSeller.prototype.getById = id => that.getByValue(id, 'id');

/**
  * Get by value
  * @param {any} value
  * @return {object<Promise>}
*/
OrderSeller.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
OrderSeller.prototype.getByIdJoinOrder = (value) => {
  const order = that.sqlTableOrder.as('order');
  const tso = that.sqlTableTimeslotOrder.as('tso');
  const u1 = that.sqlTableSellerAccount.as('u1');
  const u2 = that.sqlTableSellerAccount.as('u2');
  const query = that.sqlTable
    .select(tso.star(), u1.name.as('assembledByName'), u2.name.as('deliveredByName'), order.id.as('order_id'), order.star(), that.sqlTable.star())
    .from(that.sqlTable
      .join(order)
      .on(order.id.equals(that.sqlTable.order_id))
      .leftJoin(tso)
      .on(tso.order_id.equals(that.sqlTable.order_id))
      .leftJoin(u1)
      .on(u1.id.equals(that.sqlTable.assembledBy))
      .leftJoin(u2)
      .on(u2.id.equals(that.sqlTable.deliveredBy)))
    .where(that.sqlTable.id.equals(value)).toQuery();
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
OrderSeller.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = OrderSeller;
