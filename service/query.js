const query = {};
const sql = require('sql');

// function formatFields(table, fields) {
//   if (!null && !Array.isArray(fields)) {
//     return `${table}.${fields.join(`,${table}.`)}`;
//   }
//   return '*';
// }

query.composeQuery = (table, fields, filters, limit, offset) => {
  sql.setDialect('mysql');
  const dbTable = sql.define({
    name: table,
    columns: fields,
  });
  const sqlQuery = dbTable
    .select(dbTable.star())
    .from(dbTable)
    .limit(limit)
    .offset(offset)
    .toQuery();

  // TODO: Compose WHERE condition
  return sqlQuery.text;
};

query.validateParam = (reqParams, name, defaultValue) => {
  if (typeof defaultValue === 'number') {
    return Object.prototype.hasOwnProperty.call(reqParams, name) &&
      parseInt(reqParams[name].value, 10) > 0 ? parseInt(reqParams[name].value, 10) : defaultValue;
  }

  return Object.prototype.hasOwnProperty.call(reqParams, name) &&
    reqParams[name].value ? reqParams[name].value : defaultValue;
};

module.exports = query;
