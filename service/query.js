/* jslint node: true */


function validateParam(reqParams, name, defaultValue) {
  if (typeof defaultValue === 'number') {
    return reqParams.hasOwnProperty(name) && parseInt(reqParams[name].value) > 0 ? parseInt(reqParams[name].value) : defaultValue;
  }

  return reqParams.hasOwnProperty(name) && reqParams[name].value ? reqParams[name].value : defaultValue;
}

module.exports = {
  validateParam,
};
