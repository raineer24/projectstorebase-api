const jwt = require('jsonwebtoken');
const fs = require('fs');
const random = require('randomstring');
// const log = require('color-logs')(true, true, __filename);
const moment = require('moment');

const Util = {};

Util.signToken = (username) => {
  const cert = fs.readFileSync('./keys/server.key');
  const token = jwt.sign({ username }, cert, { algorithm: 'RS256' });

  return token;
};

Util.signSellerToken = (seller) => {
  const cert = fs.readFileSync('./keys/server.key');
  const exp = moment().add(2, 'hours').unix();
  const token = jwt.sign({ username: seller.username, role: seller.role_id, exp }, cert, { algorithm: 'RS256' });

  return token;
};


Util.generateOrderKey = () => random.generate(20) + new Date().getTime() + random.generate(20);

module.exports = Util;
