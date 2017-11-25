const query = {};

query.validateParam = (reqParams, name, defaultValue) => {
  if (typeof defaultValue === 'number') {
    return Object.prototype.hasOwnProperty.call(reqParams, name) &&
      parseInt(reqParams[name].value, 10) > 0 ? parseInt(reqParams[name].value, 10) : defaultValue;
  }

  return Object.prototype.hasOwnProperty.call(reqParams, name) &&
    reqParams[name].value ? reqParams[name].value : defaultValue;
};

module.exports = query;
