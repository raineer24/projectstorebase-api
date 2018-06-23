const jwt = require('jsonwebtoken');
const fs = require('fs');
const log = require('color-logs')(true, true, 'Item');
const random = require('randomstring');
// const log = require('color-logs')(true, true, __filename);
const moment = require('moment');

const Util = {};

const cert = fs.readFileSync('./keys/server.key');

Util.signToken = (username) => {
  const token = jwt.sign({ username }, cert, { algorithm: 'RS256' });

  return token;
};

Util.signSellerToken = (seller) => {
  const exp = moment().add(2, 'hours').unix();
  const token = jwt.sign({ username: seller.username, role: seller.role_id, exp }, cert, { algorithm: 'RH256' });

  return token;
};

Util.decodeToken = (token) => {
  let authorize = false;
  jwt.verify(token, cert, (err, result) => {
    if (err) {
      authorize = false;
    } else {
      log.info(result);
      authorize = true;
    }
  });
  return authorize;
};

Util.generateOrderKey = () => random.generate(20) + new Date().getTime() + random.generate(20);

module.exports = Util;
