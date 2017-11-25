const jwt = require('jsonwebtoken');
const fs = require('fs');
// const log = require('color-logs')(true, true, __filename);

const Util = {};

Util.signToken = (username) => {
  const cert = fs.readFileSync('./keys/server.key');
  const token = jwt.sign({ username }, cert, { algorithm: 'RS256' });

  return token;
};

module.exports = Util;
