const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const log = require('color-logs')(true, true, 'Item');

const Conn = require('../../service/connection');
const Category = require('../categories/category');

let that;

/**
  * Item constructor
  * @param {object} item
  * @return {object}
*/
function Item(item) {
  sql.setDialect('mysql');

  this.model = _.extend(item, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.db = 'grocerystore';
  this.table = 'item';
  this.dbConn = Conn;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'code',
      'name',
      'brandName',
      'price',
      'displayPrice',
      'hasVat',
      'isSenior',
      'weighted',
      'packaging',
      'packageMeasurement',
      'sizing',
      'packageMinimum',
      'packageIntervals',
      'availableOn',
      'slug',
      'imageKey',
      'enabled',
      'category1',
      'category2',
      'category3',
      'partner_id',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

Item.prototype.getRelatedCategories = results => new BluePromise((resolve, reject) => {
  const list = [];

  results.forEach((obj) => {
    list.push(obj.category1);
    list.push(obj.category2);
    list.push(obj.category3);
  });

  if (list.length === 0) {
    resolve({
      list: results,
      categories: [],
    });
    return;
  }

  new Category({}).findAll(0, 50, {
    list,
  })
    .then((catResult) => {
      resolve({
        list: results,
        categories: catResult,
      });
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * searchAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Item.prototype.searchAll = (skip, limit, filters, sortBy, sort) => {
  const keywords = filters.keyword ? filters.keyword.split(' ') : null;
  const keyword = filters.keyword ? filters.keyword : null;
  const finalFilters = _.merge(filters, { keywords });

  return new Category({}).findAll(0, 10, {
    keyword,
    keywords,
  }, sortBy, sort)
    .then((catResult) => {
      if (catResult.length > 0) {
        const temp = finalFilters;
        temp.categories = _.map(catResult, obj => obj.id);
        return that.findAll(skip, limit, temp, sortBy, sort);
      }
      return that.findAll(skip, limit, finalFilters, sortBy, sort);
    })
    .catch(() => that.findAll(skip, limit, finalFilters, sortBy, sort));
};


function executeQuery(skip, limit, filters, sortBy, sort) {
  let query = null;
  let sortString = '1';
  if (sortBy) {
    sortString = `${sortBy === 'price' ? 'sortPrice' : 'dateCreated'} ${sort}`;
  }
  let strSql = '';

  if (filters.keywords && filters.keywords.length > 1 &&
    filters.categories && filters.categories.length > 0) {
    strSql = `
      (SELECT ${that.table}.*, CAST(${that.table}.displayPrice AS int) AS sortPrice
      FROM ${that.db}.${that.table} WHERE ${that.table}.name LIKE '%${filters.keyword}%'
      )
      UNION
      (SELECT ${that.table}.*, CAST(${that.table}.displayPrice AS int) AS sortPrice
      FROM ${that.db}.${that.table} WHERE
        ${that.table}.name LIKE '%${filters.keywords[0]}%'
        ${filters.keywords[1] && filters.keywords[1].length > 2 ? ` OR ${that.table}.name LIKE '%${filters.keywords[1]}%'` : ''}
        ${filters.keywords[2] && filters.keywords[2].length > 2 ? ` OR ${that.table}.name LIKE '%${filters.keywords[2]}%'` : ''}
        ${filters.keywords[3] && filters.keywords[3].length > 2 ? ` OR ${that.table}.name LIKE '%${filters.keywords[3]}%'` : ''}
        OR ${that.table}.category1 IN (${filters.categories})
        OR ${that.table}.category2 IN (${filters.categories})
        OR ${that.table}.category3 IN (${filters.categories})
      ) ORDER BY ${sortString} ${sort} LIMIT ${skip}, ${limit}`;
  } else if (filters.keywords && filters.keywords.length > 1) {
    strSql = `
      (SELECT ${that.table}.*, CAST(${that.table}.displayPrice AS int) AS sortPrice
      FROM ${that.db}.${that.table} WHERE ${that.table}.name LIKE '%${filters.keyword}%'
      )
      UNION
      (SELECT ${that.table}.*, CAST(${that.table}.displayPrice AS int) AS sortPrice
      FROM ${that.db}.${that.table} WHERE
        ${that.table}.name LIKE '%${filters.keywords[0]}%'
        ${filters.keywords[1] && filters.keywords[1].length > 2 ? ` OR ${that.table}.name LIKE '%${filters.keywords[1]}%'` : ''}
        ${filters.keywords[2] && filters.keywords[2].length > 2 ? ` OR ${that.table}.name LIKE '%${filters.keywords[2]}%'` : ''}
        ${filters.keywords[3] && filters.keywords[3].length > 2 ? ` OR ${that.table}.name LIKE '%${filters.keywords[3]}%'` : ''}
      ) ORDER BY ${sortString} ${sort} LIMIT ${skip}, ${limit}`;
  } else if (filters.keyword && filters.categories && filters.categories.length > 0) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.name.like(`%${filters.keyword}%`))
      .or(that.sqlTable.category1.in(filters.categories))
      .or(that.sqlTable.category2.in(filters.categories))
      .or(that.sqlTable.category3.in(filters.categories))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.keyword) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.name.like(`%${filters.keyword}%`))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category2 && filters.category3) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.category2.equals(filters.category2))
      .or(that.sqlTable.category3.equals(filters.category3))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category1) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.category1.equals(filters.category1))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category2) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.category2.equals(filters.category2))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.category3) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.category3.equals(filters.category3))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.categories && filters.categories.length > 0) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .or(that.sqlTable.category1.in(filters.categories))
      .or(that.sqlTable.category2.in(filters.categories))
      .or(that.sqlTable.category3.in(filters.categories))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.suggestions && filters.suggestions.length > 0) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .or(that.sqlTable.category1.in(filters.suggestions))
      .or(that.sqlTable.category2.in(filters.suggestions))
      .or(that.sqlTable.category3.in(filters.suggestions))
      .order('RAND()')
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }
  if (strSql) {
    log.info(strSql);
    return that.dbConn.queryAsync(strSql);
  }
  log.info(query.text);
  return that.dbConn.queryAsync(query.text, query.values);
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Item.prototype.findAll = (skip, limit, filters, sortBy, sort) => new Promise((resolve, reject) => {
  let query = null;
  let sortString = '1';
  if (sortBy) {
    sortString = `${sortBy === 'price' ? 'sortPrice' : 'dateCreated'} ${sort}`;
  }

  if (filters.keyword) {
    query = that.sqlTable
      .select(that.sqlTable.star(), that.sqlTable.displayPrice.cast('int').as('sortPrice'))
      .from(that.sqlTable)
      .where(that.sqlTable.name.like(`%${filters.keyword}%`))
      .order(sortString)
      .limit(limit)
      .offset(skip)
      .toQuery();

    that.dbConn.queryAsync(query.text, query.values)
      .then((results) => {
        if (results.length === 0) {
          executeQuery(skip, limit, filters, sortBy, sort)
            .then((newResults) => {
              resolve(newResults);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          resolve(results);
        }
      })
      .catch((err) => {
        reject(err);
      });
  } else {
    executeQuery(skip, limit, filters, sortBy, sort)
      .then((newResults) => {
        resolve(newResults);
      })
      .catch((err) => {
        reject(err);
      });
  }
});

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Item.prototype.getById = id => that.getByValue(id, 'id');
Item.prototype.findById = id => that.getByValue(id, 'id');

// Item.prototype.countItems = () => {
//   let strSql = '';
//   strSql = `(SELECT COUNT(*) FROM ${that.db}.${that.table})`;
//   return that.dbConn.queryAsync(strSql);
// };


Item.prototype.getItemSuggestions = (id, skip, limit) => new BluePromise((resolve, reject) => {
  that.findById(id)
    .then((results) => {
      if (results.length > 0) {
        let category = results[0].category1;
        if (results[0].category2) {
          category = results[0].category2;
        }
        if (results[0].category3) {
          category = results[0].category3;
        }
        new Category({}).findAll(0, 10, {
          list: [category],
        })
          .then((catResult) => {
            that.findAll(skip, limit, {
              suggestions: _.map(catResult, obj => obj.id),
            })
              .then((itemList) => {
                const toDelete = new Set([id]);
                const newArray = itemList.filter(obj => !toDelete.has(obj.id));
                resolve(newArray);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject('Not Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * create
  * @return {object/number}
*/
Item.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.code, 'code')
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.insertId);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject('Found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
 * update
 * @return {object/string}
 */
Item.prototype.update = id => new BluePromise((resolve, reject) => {
  that.model.dateUpdated = new Date().getTime();
  that.findById(id)
    .then((resultList) => {
      if (!resultList[0].id) {
        reject('Not Found');
      } else {
        that.model = _.merge(resultList[0], that.model);
        const query = that.sqlTable.update(that.model)
          .where(that.sqlTable.id.equals(id)).toQuery();
        that.dbConn.queryAsync(query.text, query.values)
          .then((response) => {
            resolve(response.message);
          })
          .catch((err) => {
            reject(err);
          });
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * Save User account
  * @param {string} id
  * @return {object}
*/
Item.prototype.createMultiple = () => new BluePromise((resolve, reject) => {
  let str = [];
  str = that.model;
  _.forEach(str, (key) => {
    const itemCode = key.code;
    that.getByValue(itemCode, 'code')
      .then((results) => {
        log.info(results.length);
        if (results.length === 0 && itemCode !== undefined) {
          const query = that.sqlTable.insert(key).toQuery();
          that.dbConn.queryAsync(query.text, query.values)
            .then((response) => {
              that.getByValue(response.id, 'id')
                .then((resultList) => {
                  if (!resultList[0].id) {
                    reject('Not Found');
                  } else {
                    resolve(resultList[0]);
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject('Found');
        }
      });
  });
  resolve();
});

/**
  * Update User account
  * @param {string} id
  * @return {object}
*/
Item.prototype.updateMultiple = () => new BluePromise((resolve, reject) => {
  let str = [];
  str = that.model;
  log.info('START - update items');
  _.forEach(str, (key) => {
    const itemCode = key.code;
    log.info(itemCode);
    that.getByValue(itemCode, 'code')
      .then((results) => {
        log.info('UPDATE - RESULTS');
        if (results.length > 0 && itemCode !== undefined) {
          const query = that.sqlTable.update(key)
            .where(that.sqlTable.id.equals(results[0].id)).toQuery();
          that.dbConn.queryAsync(query.text, query.values)
            .then((response) => {
              log.info(response.message);
              // that.getByValue(response, 'id')
              //   .then((resultList) => {
              //     log.info(`RESULT LIST - ${resultList}`);
              //     if (!resultList[0].id) {
              //       log.info('Not Found');
              //     }
              //   })
              //   .catch((err) => {
              //     log.info(err);
              //   });
            })
            .catch((err) => {
              reject(err);
              log.info(err);
            });
        } else {
          log.info('Found');
        }
      });
  });
  resolve();
});

/**
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Item.prototype.getByValue = (value, field) => {
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
Item.prototype.release = () => that.dbConn.releaseConnectionAsync();

module.exports = Item;
