const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Order');
const moment = require('moment');
const config = require('../../config/config');

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
      'serviceFee',
      'deliveryFee',
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
  this.sqlTableOrderSeller = sql.define({
    name: 'orderseller',
    columns: [
      'id',
      'orderNumber',
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
      'partner_id',
      'dateCompleted',
      'dateCreated',
      'dateUpdated',
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
  that.model.number = 0;
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
  } else if (filters.partnerId) {
    query = that.sqlTable
      .select(that.sqlTable.id.as('order_id'), that.sqlTable.star(), that.sqlTableUser.star(), that.sqlTableOrderSeller.star())
      .from(that.sqlTable
        .leftJoin(that.sqlTableUser)
        .on(that.sqlTableUser.id.equals(that.sqlTable.useraccount_id))
        .leftJoin(that.sqlTableOrderSeller)
        .on(that.sqlTableOrderSeller.order_id.equals(that.sqlTable.id)))
      .where(that.sqlTable.partner_id.equals(filters.partnerId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
    log.info(query);
  } else if (filters.sendMail) {
    query = that.sqlTable
      /*eslint-disable */
      .select(that.sqlTable.star(), that.sqlTableTimeslotOrder.timeslot_id, that.sqlTableTimeslotOrder.date)
      .from(that.sqlTable
        .leftJoin(that.sqlTableTimeslotOrder)
        .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.id)))
      .where(that.sqlTable.id.equals(filters.order_id))
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
        reject('Not Found');
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

Order.prototype.processOrder = (id, gcList, tType) => new BluePromise((resolve, reject) => {
  const instTrans = new Transaction({});
  const transactionId = instTrans.getTransaction();
  const instGc = new Gc({});
  let transType = '';
  log.info('GC LIST:');
  log.info(gcList);
  if (gcList && gcList.length > 0) {
    for (let ctr = 0; ctr < gcList.length; ctr += 1) {
      instGc.getByValue(gcList[ctr], 'code').then((resultList) => {
        if (resultList[0].status !== 'unused') {
          reject(`Cannot complete order. GC ${gcList[ctr]} is not available!`);
        }
      });
    }
    transType = 'GIFTCERT_PAYMENT';
  } else {
    transType = tType;
  }
  that.setTransactionNumber(transactionId);
  that.update(id, true) // update(order_id, confirmOrder)
    .then(new Timeslotorder({ confirmed: 1 }).confirmOrder) // Update timeslotorder
    .then(new Transaction({
      order_id: id,
      number: transactionId,
      action: 'CONFIRM_ORDER',
      type: transType,
      value: 0,
    }).create) // Create transaction
    .then(() => {
      that.findAll(0, 1, { order_id: id, sendMail: true })
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
              .catch(() => { });
              new Orderseller({
              order_id: orderEntry.id,
              partner_id: orderEntry.partner_id,
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
  const timeslots = ['', '8:00AM - 10:00AM', '11:00AM - 1:00PM', '2:00PM - 4:00PM', '5:00PM - 7:00PM', '8:00PM - 10:00PM'];
  new OrderItem({}).findAll(0, 1000, {
    orderkey: orderEntry.orderkey,
  })
    .then((resultList) => {
      if (resultList.length > 0) {
        const body = `
  <table class="mainContainer" style="margin: 0 auto;">
  <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
    <td class="wrapper" width="600" align="center" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; padding-left: 10px; padding-right: 10px;" valign="top">
          <!-- Header image -->
          <table class="section header" cellpadding="0" cellspacing="0" width="600" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
            <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
              <td class="column" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                <table style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                  <tbody style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                    <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                      <td align="left" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                        <img src="http://${config.env.hostname}/assets/MAIN_01.png" alt="picsum" style="width:100%;">
                        <table width="640" border="0" cellspacing="0" cellpadding="20" bgcolor="#ff005d" style="padding: 0; margin: 0 0 10px; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                          <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                            <td align="center" style="padding: 10px; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; font-size: 16px; color: #FFFFFF; font-weight: bold;" valign="top">
                              <span style="font-face='Roboto', Arial, sans-serif">Your Wish Is My Command</style>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 16px;">Hi <b>${orderEntry.firstname}</b>,</h3>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif; text-align: justify;">Alrighty, thank you for using OMG!  Here's a recap of your order:</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </table>
         <table class="section header" cellpadding="0" cellspacing="0" width="600" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
            <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
              <td class="column" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                <table style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                  <tbody style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                    <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                      <td align="left" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                        <table width="640" border="0" cellspacing="0" cellpadding="20" bgcolor="#ff5847" class="100p" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                          <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">

                          </tr>
                        </table>
                        <table class="holiday-container" style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important;">
                          <tbody>
                            <tr>
                              <td>
                                <table class="holidayTreats" style="border-collapse:collapse;margin:0 auto;width:530px;border-spacing:0!important">
                      <tbody>
                        <tr>
                            <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:100%;padding:10px!important;" colspan="2">
                            <h2><span>Order Number #${orderEntry.number}</span></h2>
                            </td>
                           </tr>
                        <tr>
                          <td class="orderTD" style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:50%;padding:10px!important;">
                            <table style="border-collapse:collapse;border-spacing:0!important">
                              <!-- <td style="vertical-align:top;padding:0px 0px 10px;width:20px;height:20px;text-align:left!important">
                                <img src="https://assets.honestbee.com/images/order-confirmation-info@2x.png" />
                              </td> -->
                              <td class="orderRes" style="vertical-align:top;padding:0px 0px 10px;padding-left:20px;text-align:left!important">
                                <strong>Order Date: </strong>${moment(orderEntry.dateCreated).format('MMM D, YYYY')}
                                <br><br><br>
                                <strong>Service Fee: </strong>₱${parseFloat(orderEntry.serviceFee).toFixed(2)}
                                <br>
                                <strong>Delivery Fee: </strong>₱${parseFloat(orderEntry.deliveryFee).toFixed(2)}
                                <br><br>
                                <strong>Total: </strong>
                                <br>
                                <span style="font-size: 16px;">₱${parseFloat(orderEntry.total).toFixed(2)}</span>
                              </td>
                           </table>
                          </td>
                          <td class="deliver" style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:50%;padding:10px!important">
                           <table>
                            <tbody>
                              <tr>
                                <!-- <td style="vertical-align:top;padding:0px 0px 10px;width:20px;height:20px;text-align:left!important">
                                  <img src="https://assets.honestbee.com/images/order-confirmation-info@2x.png" style="margin:0 auto;float:none" />
                                </td> -->
                                <td style="vertical-align:top;padding:0px 0px 10px;padding-left:20px;text-align:left!important">
                                  <strong>Delivery Date: </strong>
                                  <br>
                                  <br>
                                  ${moment(orderEntry.date).format('MMM D, YYYY')}, ${timeslots[orderEntry.timeslot_id]} 
                                  <br><br>
                                  <strong>Deliver to</strong>
                                  <br>
                                  ${orderEntry.firstname}  ${orderEntry.lastname}
                                  <br>
                                  ${orderEntry.shippingAddress01}
                                  <br>
                                  ${orderEntry.city}, ${orderEntry.country} ${orderEntry.postalcode}
                                  <br><br>
                                  <strong>Delivery Instructions: </strong>
                                  ${orderEntry.specialInstructions}
                                  <br><br>
                                  <strong>Contact Number: </strong>
                                  <br>
                                    ${orderEntry.phone}
                                </td>
                              </tr>
                            </tbody>
                           </table>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </table></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </table>
      </td>
    </tr>
  </tbody>
</table>
<br>
<!-- start itemContainer -->
<table style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important">
  <tr>
    <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
      <table style="border-collapse:collapse;margin:0 auto;width:530px;border-spacing:0!important">
        <!-- items -->
        <tr>
          <td>
            <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
              ${_.map(resultList, item => `
                <tr>
                  <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;margin:10px auto;vertical-align:middle;padding-right:10px;width:16.666666%">
                    <img src=${config.imageRepo}${item.imageKey}.jpg style="margin:0 auto;float:none;max-width:50px;max-height:50px" onerror="http://${config.env.hostname}/assets/omg-logo-01.png" />
                  </td>
                  <td style="vertical-align:top;text-align:left;min-width:0px;padding:0px 0px 10px;padding-right:10px;width:50%">
                    <p style="margin:0 0 5px 0">${item.name}</p>
                  </td>
                  <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-right:10px;">
                    <p style="margin:0 0 5px 0;text-align:left;">x${item.quantity}</p>
                  </td>
                  <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-right:10px;width:16.666666%">
                    <p style="margin:0 0 5px 0">₱${parseFloat(item.displayPrice).toFixed(2)}</p>
                  </td>
                </tr>`).join('')}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!-- end itemContainer -->
<!-- Email Footer : BEGIN -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; max-width: 600px; margin: 0 auto;" valign="top">
  <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
    <td style="margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; padding: 20px; font-family: 'Helvetica','Arial',sans-serif; font-size: 13px; line-height: 15px; text-align: left;" align="center" valign="top">
      <webversion style="color: #cccccc; text-decoration: underline; font-weight: bold;">Our team has got you covered.  So sit back, relax and just do what you love.  We'll take care of the grocery shopping for you.  We'll send you a message once our awesome team has assembled your order.  </webversion>
      <br>
      <br>
      <br>
      <span class="unstyle-auto-detected-links">Have a wonderful day ahead of you!
      <br>
      <br>
      <br>Love,
      <br>
      <span class="unstyle-auto-detected-links"><b>OMG!</b>
      <br>
      Your Fave Grocery App
      <br>
      <br>
      <span style="font-style: italic">P.S. Actual prices may differ, and quantity is subject to availability. But our friendly OMG! staff will contact you if ever...
    </td>
  </tr>
</table>
`;
        resolve({
          from: config.mail.username,
          bcc: config.orderEmail,
          to: orderEntry.email,
          subject: `OMG! - Order Confirmation (#${orderEntry.transactionId})`,
          text: `Successfully paid and confirmed order (#${orderEntry.transactionId})`,
          html: body,
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
Order.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Order;
