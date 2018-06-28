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
      if (resultList.length > 0) {
        log.info(resultList.length);
        _.forEach(resultList, (obj) => {
          log.info(obj);
          log.info(_.map(resultList, test => test.displayPrice));
          const body = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>A responsive two column example</title>
    <style>
        /* A simple css reset */
        body,table,thead,tbody,tr,td,img {
            padding: 0;
            margin: 0;
            border: none;
            border-spacing: 0px;
            border-collapse: collapse;
            vertical-align: top;
        }

        /* Add some padding for small screens */
        .wrapper {
            padding-left: 10px;
            padding-right: 10px;
        }

        h1,h2,h3,h4,h5,h6,p {
            margin: 0;
            padding: 0;
            padding-bottom: 20px;
            line-height: 1.6;
            font-family: 'Helvetica', 'Arial', sans-serif;
        }

        p,a,li {
            font-family: 'Helvetica', 'Arial', sans-serif;
        }

        img {
            width: 100%;
            display: block;
        }

        @media only screen and (max-width: 620px) {

            .wrapper .section {
                width: 100%;
            }

            .wrapper .column {
                width: 100%;
                display: block;
            }
        }
    </style>
</head>

<body>
    <table width="100%">
        <tbody>
            <tr>
                <td class="wrapper" width="600" align="center">
                    <!-- Header image -->
                    <table class="section header" cellpadding="0" cellspacing="0" width="600">
                        <tr>
                            <td class="column">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td align="left">
                                                <img src="http://hutcake.com/assets/main-01.jpg" alt="picsum" width="600" />
                                                <table width="640" border="0" cellspacing="0" cellpadding="20" bgcolor="#ff5847" class="100p">
                                                    <tr>
                                                      <td align="center" style="font-size:24px; color:#FFFFFF;"><font face="'Roboto', Arial, sans-serif">Your order has been placed</font></td>
                                                    </tr>
                                                </table>
                                                <h2>Hi, ${orderEntry.firstname}  ${orderEntry.lastname}!</h2>
                                                <p style="text-align:justify;">Great choice. Awesome groceries from <a href="/">OMG</a>  is on its way</p>
                                                <p>We hope that you enjoy your purchase on OMG grocery and continue to shop with us a loyal customer.</p>
                                                <p style="text-align:justify;">Check below for your order details.</p>
                                                <p style="text-align:justify;">Until next time,</p>
                                                <p style="text-align:justify;">Your OMG team</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <!-- Two columns -->
                    <table class="section" cellpadding="0" cellspacing="0">
                        <tr>
                            <td class="column" width="290" valign="top">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td align="left">
                                                <img src="http://hutcake.com/assets/sub-01.jpg" alt="picsum" width="300" />
                                                <h2>Track your order</h2>
                                                <p style="text-align:justify;">Hi ${orderEntry.firstname}, We're getting your order ready to be deliver. We will notify you when it has been delivered. Please take this time to review your order details.</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td class="column" width="20" valign="top">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td> &nbsp; </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td class="column" width="290" valign="top">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td align="left">
                                                <img src="http://hutcake.com/assets/sub-03.jpg" alt="picsum" width="300" />
                                                <h2>Delivery Address: </h2>
                                                <p style="text-align:center;"><strong>${orderEntry.firstname}  ${orderEntry.lastname}</strong></p>
                                                <p style="text-align:center;"><strong>${orderEntry.shippingAddress01}</strong></p>
                                                <p><span style="color: #ff005d;"><strong>Order details: (Order number:${orderEntry.number})</strong></span></p>
                                                <table style="background-color: rgb(239, 239, 239);width: 100%;">
                                                <p><span style="font-size: 18px;">Items ordered: </span></p>
                                                ${_.map(resultList, item => `<p>${item.name} &nbsp; (${item.displayPrice} x ${item.quantity})</p>`).join('')}
                                                <hr>
                                                <p><span style="font-size: 18px;">Total: PHP ${orderEntry.total}</span></p>
                                                <table>
                                                
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
</body>
</html>
      `;
          resolve({
            from: 'info@eos.com.ph',
            bcc: 'raineerdelarita@gmail.com',
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
