const nodemailer = require('nodemailer');
const BluePromise = require('bluebird');
const config = require('../config/config');

let that;

function Mailer(options) {
  this.options = options;
  that = this;
  this.transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: true,
    auth: {
      user: config.mail.username,
      pass: config.mail.password,
    },
  });
}

Mailer.prototype.send = () => new BluePromise((resolve, reject) => {
  that.transporter.sendMail(that.options, (error, info) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(info.messageId);
  });
});

module.exports = Mailer;
