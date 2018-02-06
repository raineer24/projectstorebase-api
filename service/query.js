const query = {};
const sql = require('sql');
const log = require('color-logs')(true, true, '');

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
  strSql = sqlQuery.text;

  if (filters) {
    if (filters.orderId && filters.timeslotId) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.order_id = ${filters.orderId} && ${table}.order_id = ${filters.timeslotId} LIMIT ${skip}, ${limit};`;
    } else if (filters.categoryList) {
      const condition = filters.categoryList.join(` OR ${table}.id = `);
      strSql = `SELECT * FROM ${table} WHERE ${table}.id = ${condition} LIMIT ${skip}, ${limit};`;
    } else if (filters.itemId && filters.orderkey) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.item_id = ${filters.itemId} AND ${table}.orderkey = '${filters.orderkey}' LIMIT ${skip}, ${limit};`;
    } else if (filters.orderkey) {
      strSql = `SELECT ${table}.id AS 'orderItem_id', ${table}.*, item.* FROM ${table} INNER JOIN item ON ${table}.item_id = item.id WHERE ${table}.orderkey = '${filters.orderkey}';`;
    } else if (filters.keyword) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.name LIKE '%${filters.keyword}%' LIMIT ${skip}, ${limit};`;
    } else if (filters.category2 && filters.category3) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.category2 = ${filters.category2} OR ${table}.category3 = ${filters.category3} LIMIT ${skip}, ${limit};`;
    } else if (filters.category1) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.category1 = ${filters.category1} LIMIT ${skip}, ${limit};`;
    } else if (filters.category2) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.category2 = ${filters.category2} LIMIT ${skip}, ${limit};`;
    } else if (filters.category3) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.category3 = ${filters.category3} LIMIT ${skip}, ${limit};`;
    } else if (filters.session_id) {
      strSql = `SELECT * FROM ${table} WHERE ${table}.session_id = ${filters.session_id} LIMIT ${skip}, ${limit};`;
    }
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
