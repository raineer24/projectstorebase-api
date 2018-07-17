const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const log = require('color-logs')(true, true, 'Order Seller');
const moment = require('moment');
const config = require('../../config/config');

const Mailer = require('../../service/mail');
const Conn = require('../../service/connection');
const OrderStatusLogs = require('../orderstatuslogs/orderstatuslogs');
const OrderItem = require('../orderItems/orderItem');

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
      'partner_id',
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
      'partner_id',
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
      'partner_id',
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
                          new Mailer(that.mailDeliveredConfirmation(orderList[0], itemList)).send()
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

OrderSeller.prototype.mailDeliveredConfirmation = (orderSeller, itemList) => {
  const timeslots = ['', '8:00AM - 10:00AM', '11:00AM - 1:00PM', '2:00PM - 4:00PM', '5:00PM - 7:00PM', '8:00PM - 10:00PM'];
  /*eslint-disable */
  const grandTotal = Number(orderSeller.serviceFee) + Number(orderSeller.deliveryFee) + Number(orderSeller.finalItemTotal);
  const body = `
    <table class="mainContainer" style="margin: 0 auto;">
     <tr>
      <td style="vertical-align:top;text-align:center">
        <table style="border-collapse:collapse;width:580px;margin:0 auto;text-align:inherit;background-color:#fff;height:80px;margin-top:20px;border-spacing:0!important">
          <tr>
            <td style="vertical-align:top;text-align:center" align="center" valign="top">
              <table style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important">
                <tr>
                  <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
                    <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
                      <tr>
                      <td>
                         <img src="http://${config.env.hostname}/assets/MAIN_01.png" alt="picsum" style="width:100%;" />
                      </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
     </tr>
    </table>
    <table style="margin: 0 auto;">
      <tr>
        <td style="vertical-align:top">
          <table style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
                <table class="glenda" style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
                  <tr>
                    <td style="vertical-align:top;padding:0px 10px 10px;text-align:left;">
                      <h2 style="font-weight:normal;word-break:normal;line-height:normal;font-size:20px;margin-top:0">Hi, ${orderSeller.firstname}</h2>
                      <p>Popping-fresh groceries from <strong>OMG!</strong> is on your way. Expect delivery on <strong>${moment(orderSeller.date).format('MMM D, YYYY')}, ${timeslots[orderSeller.timeslot_id]}</strong></p>
                      <p>Here's a list of what to expect in your <strong>OMG!</strong> bag:</p>
                    </td>
                    <td></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table class="fulfilled items" style="margin: 0 auto;">
      <tr>
        <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
          <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;background-color:#f5f5f5;color:#000000;text-align:left;padding-left:10px;font-size:16px;padding-right:10px;width:100%;padding:10px!important">
                <p style="margin:0 0 5px 0">
                  <strong>Fulfilled Items</strong>
                </p>
              </td>
              <td></td>
            </tr>
            <tr>
              <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:100%;padding:10px!important;padding:0px!important">
                <table style="border-collapse:collapse;margin:0 auto;width:580px;margin:0px;table-layout:fixed;border-spacing:0!important">
                   ${_.map(itemList, item => {
                     if (Number(item.finalQuantity) == 0) {
                      return '';
                     }
                      const itemTotalPrice =  Number(item.finalQuantity) * Number(item.finalPrice);
                      return `<tr>
                        <td style="vertical-align:top;min-width:0px;padding:0px 10px 10px 10px;vertical-align:middle;width:16.666666%;">
                            <img src=${config.imageRepo}${item.imageKey}.jpg style="margin:0 auto;float:none;max-width:50px;max-height:50px" onerror="http://${config.env.hostname}/assets/omg-logo-01.png" />
                        </td>
                        <td style="vertical-align:top;text-align:left;min-width:0px;padding:0px 10px 10px 0px;width:58.333333%">
                          <p style="margin:0 0 5px 0">${item.name}</p>
                          <p style="margin:0 0 5px 0">x${item.finalQuantity}</p>
                        </td>
                        <td style="vertical-align:top;padding:0px 0px 10px;width:8.333333%">&nbsp;</td>
                        <td style="vertical-align:top;min-width:0px;padding:0px 10px 10px 0px;width:16.666666%;text-align:right;">
                          <p style="margin:0 0 5px 0;text-align:left;color:#a1a1a1;white-space:nowrap"><p style="margin:0 0 5px 0">₱${parseFloat(itemTotalPrice).toFixed(2)}</p></p>
                        </td>
                      </tr>`
                   }).join('')}
                </table>

              </td>
            </tr>
          </table>
          <br>
          <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Groceries Subtotal</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(orderSeller.finalItemTotal).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Service Fee</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(orderSeller.serviceFee).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Delivery Fee</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(orderSeller.deliveryFee).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Grand Total</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(grandTotal).toFixed(2)}</p>
              </td>
            </tr>
          </table>
                         <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; max-width: 600px; margin: 0 auto;" valign="top">
  <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
    <td style="margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; padding: 20px; font-family: 'Helvetica','Arial',sans-serif; font-size: 13px; line-height: 15px; text-align: left;" align="center" valign="top">
       <br>Love,
      <br>
      <span class="unstyle-auto-detected-links"><b>OMG!</b>
      <br>
      Your Fave Grocery App
      <br>
   </td>
  </tr>
</table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
  return {
    from: config.mail.username,
    bcc: config.orderEmail,
    to: orderSeller.email,
    subject: `OMG! - Order #${orderSeller.orderNumber} will be delivered now`,
    text: `Successfully Delivered orders ${orderSeller.email}`,
    html: body,
  };
};

OrderSeller.prototype.mailCompletedConfirmation = (orderSeller, itemList) => {
  const grandTotal = Number(orderSeller.serviceFee) + Number(orderSeller.deliveryFee) + Number(orderSeller.finalItemTotal);
  const body = `
   <table class="mainContainer" style="margin: 0 auto;">
     <tr>
      <td style="vertical-align:top;text-align:center">
        <table style="border-collapse:collapse;width:580px;margin:0 auto;text-align:inherit;background-color:#fff;height:80px;margin-top:20px;border-spacing:0!important">
          <tr>
            <td style="vertical-align:top;text-align:center" align="center" valign="top">
              <table style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important">
                <tr>
                  <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
                    <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
                      <tr>
                      <td>
                         <img src="http://${config.env.hostname}/assets/MAIN_01.png" alt="picsum" style="width:100%;" />
                      </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
     </tr>
    </table>
    <table style="margin: 0 auto;">
      <tr>
        <td style="vertical-align:top">
          <table style="border-collapse:collapse;padding:0px;width:100%;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
                <table class="glenda" style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
                  <tr>
                    <td style="vertical-align:top;padding:0px 10px 10px;text-align:left;">
                      <h2 style="font-weight:normal;word-break:normal;line-height:normal;font-size:20px;margin-top:0">Hi, ${orderSeller.firstname}</h2>
                      <p>It's all good:  We have shopped, assembled, and delivered your order!</p>
                      <p>It was a blast shopping for you!  Do you know that on the average, people spend at least 3 hours doing grocery shopping?  So good choice on using OMG! What will you do with the time you saved?</p>
                      <p>Rate your OMG! Experience <a href="http://${config.env.hostname}/user/orders/detail/${orderSeller.orderkey}"/>Click Link</a></p>
                    </td>
                    <td></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table class="fulfilled items" style="margin: 0 auto;">
      <tr>
        <td style="vertical-align:top;padding:10px 20px 0px 0px;padding-right:0px">
          <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;background-color:#f5f5f5;color:#000000;text-align:left;padding-left:10px;font-size:16px;padding-right:10px;width:100%;padding:10px!important">
                <p style="margin:0 0 5px 0">
                  <strong>Fulfilled Items</strong>
                </p>
              </td>
              <td></td>
            </tr>
            <tr>
              <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:100%;padding:10px!important;padding:0px!important">
                <table style="border-collapse:collapse;margin:0 auto;width:580px;margin:0px;table-layout:fixed;border-spacing:0!important">
                   ${_.map(itemList, item => {
                        if (Number(item.finalQuantity) == 0) {
                          return '';
                        }
                        const itemTotalPrice = Number(item.finalQuantity) * Number(item.finalPrice);
                        return `<tr>
                        <td style="vertical-align:top;min-width:0px;padding:0px 10px 10px 10px;vertical-align:middle;width:16.666666%;">
                            <img src=${config.imageRepo}${item.imageKey}.jpg style="margin:0 auto;float:none;max-width:50px;max-height:50px" onerror="http://${config.env.hostname}/assets/omg-logo-01.png" />
                        </td>
                        <td style="vertical-align:top;text-align:left;min-width:0px;padding:0px 10px 10px 0px;width:58.333333%">
                          <p style="margin:0 0 5px 0">${item.name}</p>
                          <p style="margin:0 0 5px 0">x${item.finalQuantity}</p>
                        </td>
                        <td style="vertical-align:top;padding:0px 0px 10px;width:8.333333%">&nbsp;</td>
                        <td style="vertical-align:top;min-width:0px;padding:0px 10px 10px 0px;width:16.666666%;text-align:right;">
                          <p style="margin:0 0 5px 0;text-align:left;color:#a1a1a1;white-space:nowrap"><p style="margin:0 0 5px 0">₱${parseFloat(itemTotalPrice).toFixed(2)}</p></p>
                        </td>
                      </tr>`
    }).join('')}
                </table>

              </td>
            </tr>
          </table>
          <br>
          <table style="border-collapse:collapse;margin:0 auto;width:580px;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Groceries Subtotal</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(orderSeller.finalItemTotal).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Service Fee</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(orderSeller.serviceFee).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Delivery Fee</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(orderSeller.deliveryFee).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:right;padding-right:10px;width:83.333333%">
                <p style="margin:0 0 5px 0">Grand Total</p>
              </td>
              <td style="vertical-align:top;min-width:0px;padding:0px 0px 10px;padding-top:0px;padding-bottom:0px;margin-top:0px;margin-bottom:0px;text-align:left;padding-right:10px;width:16.666666%">
                <p style="margin:0 0 5px 0;text-align:right;white-space:nowrap">₱${parseFloat(grandTotal).toFixed(2)}</p>
              </td>
            </tr>
          </table>
                         <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; max-width: 600px; margin: 0 auto;" valign="top">
  <tr style="padding: 0; margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top;" valign="top">
    <td style="margin: 0; border: none; border-spacing: 0px; border-collapse: collapse; vertical-align: top; padding: 20px; font-family: 'Helvetica','Arial',sans-serif; font-size: 13px; line-height: 15px; text-align: left;" align="center" valign="top">
       <br>Love,
      <br>
      <span class="unstyle-auto-detected-links"><b>OMG!</b>
      <br>
      Your Fave Grocery App
      <br>
   </td>
  </tr>
</table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
  return {
    from: config.mail.username,
    bcc: config.orderEmail,
    to: orderSeller.email,
    subject: `Completed #${orderSeller.orderNumber} All item orders delivered.`,
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
  } else if (filters.partnerId && filters.mode === 'orderlist') {
    let whereString = `${that.table}.partner_id = ${filters.partnerId}`;
    if (filters.partnerId === 1) {
      whereString += ` OR ${that.table}.partner_id != ${filters.partnerId}`;
    }
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
  } else if (filters.partnerId && filters.mode === 'assembly') {
    // const now = new Date();
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const today = moment().utcOffset(8).format('YYYY-MM-DD');
    // const tomorrow = moment().utcOffset(8).add(1, 'days').format('YYYY-MM-DD');
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
        .where(that.sqlTable.partner_id.equals(filters.partnerId))
        // .and(that.sqlTable.dateCreated.gte(today))
        // .and(that.sqlTableTimeslotOrder.datetime.between(today, tomorrow))
        .and(that.sqlTableTimeslotOrder.date.equals(today))
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
        .where(that.sqlTable.partner_id.equals(filters.partnerId))
        .and(sql.functions.UPPER(that.sqlTable.status).equals(filters.orderStatus.toUpperCase()))
        // .and(that.sqlTable.dateCreated.gte(today))
        // .and(that.sqlTableTimeslotOrder.datetime.between(today, tomorrow))
        .and(that.sqlTableTimeslotOrder.date.equals(today))
        .order(sortString)
        .limit(limit)
        .offset(skip)
        .toQuery();
    }
  } else if (filters.partnerId) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTableSellerAccount.name.as('sellerAccountName'), that.sqlTableTimeslotOrder.timeslot_id)
      .from(that.sqlTable
        .join(that.sqlTableOrder)
        .on(that.sqlTableOrder.id.equals(that.sqlTable.order_id))
        .leftJoin(that.sqlTableSellerAccount)
        .on(that.sqlTableSellerAccount.id.equals(that.sqlTable.selleraccount_id))
        .leftJoin(that.sqlTableTimeslotOrder)
        .on(that.sqlTableTimeslotOrder.order_id.equals(that.sqlTable.order_id)))
      .where(that.sqlTable.partner_id.equals(filters.partnerId))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.takeOrder) {
    // const now = new Date();
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const today = moment().utcOffset(8).startOf('day').valueOf();
    const tomorrow = moment().utcOffset(8).endOf('day').valueOf();
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.selleraccount_id.equals(filters.selleraccount_id)
        .and(that.sqlTable.dateAssembled.between(today, tomorrow)))
      .toQuery();
  } else if (filters.sendMail) {
    query = that.sqlTable
      /*eslint-disable */
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
  log.info(query.values);
  return that.dbConn.queryAsync(query.text, query.values);
};

/**
  * itemCount
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
OrderSeller.prototype.countFreshFrozen = (filters) => {
  // const now = new Date();
  // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const today = moment().utcOffset(8).startOf('day').valueOf();
  const tomorrow = moment().utcOffset(8).endOf('day').valueOf();
  const strSql = `
    SELECT os.id, os.order_id, count(oi.id) AS itemCount
      FROM orderseller as os
      LEFT JOIN timeslotorder as tso ON tso.order_id = os.order_id
      LEFT JOIN orderitem as oi ON oi.order_id = os.order_id
      LEFT JOIN item as it ON it.id = oi.item_id
      WHERE it.category1 = 2 || it.category1 = 3
        AND os.partner_id = ${filters.partnerId}
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
