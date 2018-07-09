const BluePromise = require('bluebird');
const sql = require('sql');
const _ = require('lodash');
const log = require('color-logs')(true, true, 'Order');
const moment = require('moment');

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
  new OrderItem({}).findAll(0, 1000, {
    orderkey: orderEntry.orderkey,
  })
    .then((resultList) => {
      if (resultList.length > 0) {
        log.info(resultList.length);
        _.forEach(resultList, (obj) => {
          log.info(obj);
          const body = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>A responsive two column example</title>
  <!-- Latest compiled and minified CSS -->
  <style>
  img {
            width: 100%;
            display: block;
        }
        .email-container {
          width: 100%;
        }
        .orderTD {
          width: 50%;
        }
        .deliver {
          width: 50%;
        }

@media only screen and (max-width: 620px) {
  .wrapper .section {
    width: 100%;
  }

  .wrapper .column {
    width: 100%;
    display: block;
  }
 .holidayTreats td {
    width: 100%!important;
    float: left;
  }
  .deliver img {
    display: none;
  }
  .orderTD img {
    display:none;
  }



}
</style>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>

<body style="border-collapse:collapse;height:100%;width:100%;min-width:600px;table-layout:fixed;background-color:#eee;color:#212121;font-family:"Helvetica Neue","Helvetica","Arial",sans-serif;font-weight:normal;margin:0;padding:0;text-align:center;line-height:1.3;font-size:14px;line-height:19px;border-spacing:0!important;">
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
                        <img src="http://hutcake.com/assets/omg-logo-01.png" alt="picsum" style="margin:0 auto;margin-top:15px;margin-bottom:4px;width:34%;max-width:250px;height:auto;float:none;clear:none">
                        <table width="640" border="0" cellspacing="0" cellpadding="20" bgcolor="#ff5847" class="100p" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                          <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
                            <td align="center" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; font-size: 24px; color: #FFFFFF;" valign="top">
                              <font face="'Roboto', Arial, sans-serif">Your order has been placed</font>
                            </td>
                          </tr>
                        </table>
                        <h2 style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif;">Hi, ${orderEntry.firstname}  ${orderEntry.lastname}!</h2>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif; text-align: justify;">Great choice. Awesome groceries from
                          <a href="/" style="font-family: 'Helvetica', 'Arial', sans-serif;">OMG</a> is on its way</p>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif;">We hope that you enjoy your purchase on OMG grocery and continue to shop with us a loyal customer.</p>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif; text-align: justify;">Check below for your order details.</p>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif; text-align: justify;">Until next time,</p>
                        <p style="margin: 0; padding: 0; padding-bottom: 20px; line-height: 1.6; font-family: 'Helvetica', 'Arial', sans-serif; text-align: justify;">Your OMG team</p>
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
                        <img src="http://hutcake.com/assets/main-01.jpg" alt="picsum" width="600" style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; width: 100%; display: block;">
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
                            <h2>Gaisano Supermarket</h2>
                            <h2><span>${moment(orderEntry.dateCreated).format('MMM D, YYYY')}</span></h2>
                            </td>
                           </tr>
                        <tr>
                          <td class="orderTD" style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:50%;padding:10px!important;">
                            <table style="border-collapse:collapse;border-spacing:0!important">
                              <td style="vertical-align:top;padding:0px 0px 10px;width:20px;height:20px;text-align:left!important"><img src="https://assets.honestbee.com/images/order-confirmation-info@2x.png" /></td>
                              <td class="orderRes" style="vertical-align:top;padding:0px 0px 10px;padding-left:20px;text-align:left!important">
                                <strong>Order number: </strong>
                                #${orderEntry.number}
                                <br>
                                <br>
                                <br>
                                <strong>Order date: </strong>
                                <br>
                                ${moment(orderEntry.dateCreated).format('MMM D, YYYY')}
                                <br>
                                <br>
                                <strong>Total: </strong>
                                <br>
                                ${parseFloat(orderEntry.total).toFixed(2)}
                              </td>
                           </table>
                          </td>
                          <td class="deliver" style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:50%;padding:10px!important">
                           <table>
                            <tbody>
                              <tr>
                                <td style="vertical-align:top;padding:0px 0px 10px;width:20px;height:20px;text-align:left!important">
                                  <img src="https://assets.honestbee.com/images/order-confirmation-info@2x.png" style="margin:0 auto;float:none" />
                                </td>
                                <td style="vertical-align:top;padding:0px 0px 10px;padding-left:20px;text-align:left!important">
                                  <strong>Deliver to</strong>
                                  <br>
                                  ${orderEntry.firstname}  ${orderEntry.lastname}
                                  <br>
                                  ${orderEntry.shippingAddress01}
                                  <br>
                                  <br>
                                  <strong>Special Instructions: </strong>
                                  No special Instructions instructed
                                  <br>
                                  <br>
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
            </tbody></table>
            <br>
            <!-- start itemContainer -->
            <table style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important">
              <tr>
                <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
                  <table style="border-collapse:collapse;margin:0 auto;width:530px;border-spacing:0!important">
                    <tr>
                      <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;border-bottom:4px solid #ffcb00;padding-right:10px;width:100%;padding:10px!important;padding:0px!important">
                        <img src="http://directory.clix.com.ph/images/logos/7079.jpg" style="margin:0 auto;float:none;max-width:180px"/>
                      </td>
                    </tr>
                    <!-- items -->
                    <tr>
                      <td>
                        <table style="border-collapse:collapse;margin:0 auto;width:480px;border-spacing:0!important">
                          ${_.map(resultList, item => `<tr>
                            <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;margin:10px auto;vertical-align:middle;padding-right:10px;width:16.666666%">
                              <img src="https://s3-ap-southeast-2.amazonaws.com/grocerymegan62201/grocery/${item.imageKey}.jpg" style="margin:0 auto;float:none;max-width:50px;max-height:50px" onerror="http://hutcake.com/assets/omg-logo-01.png" />
                            </td>
                            <td style="vertical-align:top;text-align:left;min-width:0px;padding:0px 0px 10px;padding-right:10px;width:50%">
                              <p style="margin:0 0 5px 0">${item.name}</p>
                            </td>
                            <td>
                              <p style="margin:0 0 5px 0;text-align:left;color:#a1a1a1">x${item.quantity}</>
                            </td>
                            <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-right:10px;width:16.666666%">
                              <p>${parseFloat(item.displayPrice).toFixed(2)}</>
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
        <td style="margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; padding: 20px; font-family: sans-serif; font-size: 12px; line-height: 15px; text-align: center; color: #888888;" align="center" valign="top">
          <webversion style="color: #cccccc; text-decoration: underline; font-weight: bold;">View as a Web Page</webversion>
          <br>
          <br> Eos Omg
          <br>
          <span class="unstyle-auto-detected-links">©2018 OMG All Rights Reserved
          <br>
          <br>
          <unsubscribe style="color: #888888; text-decoration: underline;">unsubscribe</unsubscribe>
          </td>

      </tr>

    </table>
 <table border="0" cellpadding="0" cellspacing="0" align="center" width="600" style="border: none; vertical-align: top; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit; max-width: 600px; margin: 0 auto;" class="wrapper" valign="top">

          <!-- SOCIAL NETWORKS -->
          <!-- Image text color should be opposite to background color. Set your url, image src, alt and title. Alt text should fit the image size. Real image size should be x2 -->
          <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
            <td align="center" valign="top" style="border: none; vertical-align: top; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; padding-top: 25px;" class="social-icons" width="87.5%">
              <table width="256" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0; border: none; vertical-align: top; border-collapse: collapse; border-spacing: 0; padding: 0;" valign="top">
                <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">

                  <!-- ICON 1 -->
                  <td align="center" valign="top" style="border: none; vertical-align: top; margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
                    <a target="_blank" href="https://raw.githubusercontent.com/konsav/email-templates/" style="font-family: 'Helvetica', 'Arial', sans-serif; text-decoration: none;">
                      <img border="0" vspace="0" hspace="0" style="border-spacing: 0px; border-collapse: collapse; vertical-align: top; width: 100%; padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block; color: #000000;" alt="F" title="Facebook" width="44" height="44" src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/facebook.png">
                    </a>
                  </td>

                  <!-- ICON 2 -->
                  <td align="center" valign="top" style="border: none; vertical-align: top; margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
                    <a target="_blank" href="https://raw.githubusercontent.com/konsav/email-templates/" style="font-family: 'Helvetica', 'Arial', sans-serif; text-decoration: none;">
                      <img border="0" vspace="0" hspace="0" style="border-spacing: 0px; border-collapse: collapse; vertical-align: top; width: 100%; padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block; color: #000000;" alt="T" title="Twitter" width="44" height="44" src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/twitter.png">
                    </a>
                  </td>

                  <!-- ICON 3 -->
                  <td align="center" valign="top" style="border: none; vertical-align: top; margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
                    <a target="_blank" href="https://raw.githubusercontent.com/konsav/email-templates/" style="font-family: 'Helvetica', 'Arial', sans-serif; text-decoration: none;">
                      <img border="0" vspace="0" hspace="0" style="border-spacing: 0px; border-collapse: collapse; vertical-align: top; width: 100%; padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block; color: #000000;" alt="G" title="Google Plus" width="44" height="44" src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/googleplus.png">
                    </a>
                  </td>

                  <!-- ICON 4 -->
                  <td align="center" valign="top" style="border: none; vertical-align: top; margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
                    <a target="_blank" href="https://raw.githubusercontent.com/konsav/email-templates/" style="font-family: 'Helvetica', 'Arial', sans-serif; text-decoration: none;">
                      <img border="0" vspace="0" hspace="0" style="border-spacing: 0px; border-collapse: collapse; vertical-align: top; width: 100%; padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block; color: #000000;" alt="I" title="Instagram" width="44" height="44" src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/instagram.png">
                    </a>
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
          <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
            <td align="center" valign="top" style="border: none; vertical-align: top; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 13px; font-weight: 400; line-height: 150%; padding-top: 20px; padding-bottom: 20px; color: #999999; font-family: sans-serif;" class="footer" width="87.5%">

              This email template was sent to&nbsp;you becouse we&nbsp;want to&nbsp;make the&nbsp;world a&nbsp;better place.
              <br> You&nbsp;could change your
              <a href="https://github.com/konsav/email-templates/" target="_blank" style="text-decoration: underline; color: #999999; font-family: sans-serif; font-size: 13px; font-weight: 400; line-height: 150%;">subscription settings</a> anytime.

              <!-- ANALYTICS -->
              <!-- http://www.google-analytics.com/collect?v=1&tid={{UA-Tracking-ID}}&cid={{Client-ID}}&t=event&ec=email&ea=open&cs={{Campaign-Source}}&cm=email&cn={{Campaign-Name}} -->
              <img width="1" height="1" border="0" vspace="0" hspace="0" style="border-spacing: 0px; border-collapse: collapse; vertical-align: top; width: 100%; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;" src="https://raw.githubusercontent.com/konsav/email-templates/master/images/tracker.png">

            </td>
          </tr>

          <!-- End of WRAPPER -->
        </table>


</body>

</html>
`;
          resolve({
            from: 'info@eos.com.ph',
            bcc: 'info@eos.com.ph',
            to: orderEntry.email,
            subject: `OMG - Order confirmation ${orderEntry.transactionId}`,
            text: `Successfully paid and confirmed order # ${orderEntry.transactionId}`,
            html: body,
          });
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
