const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const config = require('../../config/config');

const Conn = require('../../service/connection');
const log = require('color-logs')(true, true, 'Rating');
const Mailer = require('../../service/mail');
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
                      log.info('Email sent feedback sent!');
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
  let img = '';
  let stars = '';
  if (ratingEntry.feedbacktype === 3) {
    img += 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/white-smiling-face_263a.png';
  }
  if (ratingEntry.feedbacktype === 2) {
    img += 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/neutral-face_1f610.png';
  }
  if (ratingEntry.feedbacktype === 1) {
    img += 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/white-frowning-face_2639.png';
  }
  if (ratingEntry.feedbacktype === 0) {
    img += 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/facebook/138/thinking-face_1f914.png';
  }
  if (ratingEntry.starCount === '5') {
    log.info('result5');
    stars += '<div><span style="color: #ff5847;font-size: 19px;">★★★★★</span></div>';
  }
  if (ratingEntry.starCount === '4') {
    log.info('result');
    stars += '<div><span style="color: #ff5847;font-size: 19px;">★★★★☆</span></div>';
  }
  if (ratingEntry.starCount === '3') {
    log.info('result');
    stars += '<div><span style="color: #ff5847;font-size: 19px;">★★★☆☆</span></div>';
  }
  if (ratingEntry.starCount === '2') {
    log.info('result');
    stars += '<div><span style="color: #ff5847;font-size: 19px;">★★☆☆☆</span></div>';
  }
  if (ratingEntry.starCount === '1') {
    log.info('result');
    stars += '<div><span style="color: #ff5847;font-size: 19px;">★☆☆☆☆</span></div>';
  }
  if (ratingEntry.starCount === '0') {
    log.info('result');
    stars += '<div><span style="color: #ff5847;font-size: 19px;">☆☆☆☆☆</span></div>';
  }
  const body = `
   <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
 <head>
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
</head>
<body>
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
                        <img src="http://${config.env.hostname}/assets/omg-logo-01.png" style="margin:0 auto;margin-top:15px;margin-bottom:4px;width:34%;max-width:250px;height:auto;float:none;clear:none;display:inline-block" />
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
                                    <td style="vertical-align:top;padding:0px 0px 10px;text-align:center;padding:0px 40px">
                                     <h2 style="font-weight:normal;word-break:normal;line-height:normal;font-size:20px;margin-top:0">Customer Name: ${order.firstname} ${order.lastname}</h2>
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
          <table style="border-collapse:collapse;margin:0 auto;width:480px;border-spacing:0!important">
            <tr>
              <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;background-color:#f5f5f5;color:#000000;text-align:left;padding-left:10px;font-size:16px;padding-right:10px;width:100%;padding:10px!important">
                <p style="margin:0 0 5px 0;float: left">
                  <strong>Feedback Rating Review:<span style="font-size: 17px;">${stars}</span></strong>
                </p>
              </td>
              <td></td>
            </tr>
            <tr>
              <td style="vertical-align:top;background:#f2f2f2;border:1px solid #d9d9d9;min-width:0px;padding:0px 0px 10px;background-color:#ffffff;padding-right:10px;width:100%;padding:10px!important;padding:0px!important">
                <table style="border-collapse:collapse;margin:0 auto;width:480px;margin:0px;table-layout:fixed;border-spacing:0!important">
                  <tr>
                    
                    <td style="text-align:left;min-width:0px;padding:0px 0px 10px;padding-right:10px;width:100%">
                      <p style="margin:7px 0px 5px 8px">${ratingEntry.feedback}</p>
                    </td>
                    
                    
                    <td
                  </tr>
                  <tr>

                    <td style="text-align:left;min-width:0px;padding:0px 0px 10px;padding-right:10px;width:100%">
                      <img src="${img}" style="margin:0 auto;float:none;max-width: 24%;max-height: 74px;"/>
                    </td>
                    
                    
                    <td
                  </tr>
                </table>
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
    to: config.feedbackEmail,
    subject: 'FEEDBACK Rating review',
    text: `feedback e-mail ${order.email}`,
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
