const query = {};
const sql = require('sql');
const log = require('color-logs')(true, true, '');

// function formatFields(table, fields) {
//   if (!null && !Array.isArray(fields)) {
//     return `${table}.${fields.join(`,${table}.`)}`;
//   }
//   return '*';
// }

query.composeQuery = (table, fields, filters, limit, skip) => {
  sql.setDialect('mysql');
  const dbTable = sql.define({
    name: table,
    columns: fields,
  });
  let strSql;

  const sqlQuery = dbTable
    .select(dbTable.star())
    .from(dbTable)
    .limit(limit)
    .offset(skip)
    .toQuery();
  strSql = sqlQuery;

  if (filters.keyword) {
    strSql = `SELECT * FROM ${table} WHERE ${table}.name LIKE '%${filters.keyword}%' LIMIT ${skip}, ${limit};`;
  } else if (filters.category2 && filters.category3) {
    strSql = `SELECT * FROM ${table} WHERE ${table}.category2 = ${filters.category2} OR ${table}.category3 = ${filters.category3} LIMIT ${skip}, ${limit};`;
  } else if (filters.category2) {
    strSql = `SELECT * FROM ${table} WHERE ${table}.category2 = ${filters.category2} LIMIT ${skip}, ${limit};`;
  } else if (filters.category3) {
    strSql = `SELECT * FROM ${table} WHERE ${table}.category3 = ${filters.category3} LIMIT ${skip}, ${limit};`;
  }
  log.info(strSql);

  return strSql;
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
