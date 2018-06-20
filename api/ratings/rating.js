const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');

const Conn = require('../../service/connection');
const log = require('color-logs')(true, true, 'Rating');
const Mailer = require('../../service/mail');

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
  that = this;
}

/**
  * create
  * @return {object/number}
*/
Rating.prototype.create = () => new BluePromise((resolve, reject) => {
  const query = that.sqlTable.insert(that.model).toQuery();
  that.dbConn.queryAsync(query.text, query.values)
    .then((response) => {
      that.getById(response.insertId)
        .then((resultList) => {
          const ratingEntry = resultList[0];
          log.info(ratingEntry);
          if (!resultList[0].id) {
            reject('Not found');
          } else {
            new Mailer(that.mailConfirmation(ratingEntry)).send()
              .then(() => {
                log.info(`Email feedback notification ${resultList[0].email}`);
              })
              .catch((err) => {
                log.error(`Failed to send ${err}`);
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

Rating.prototype.mailConfirmation = (ratingEntry) => {
  const body = `
  <div><p>Hi,</p></div>
  <div><b>Feedback: ${ratingEntry.feedback}</b></div>
  <div><b>Date Created: ${ratingEntry.dateCreated}</b></div>
  <div><p><a href="hutcake.com">EMAIL FEEDBACK NOTIFICATION</a></p></div>
  <div><p>Thank you!</p></div>
  `;
  return {
    from: 'info@eos.com.ph',
    to: 'raineerdelarita@gmail.com',
    subject: 'OMG - Feedback Email ',
    text: `Successfully sent feedback with e-mail ${ratingEntry.email}`,
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
