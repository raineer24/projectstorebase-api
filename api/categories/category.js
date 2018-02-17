const BluePromise = require('bluebird');
const _ = require('lodash');
const sql = require('sql');
const ConnNew = require('../../service/connectionnew');

const log = require('color-logs')(true, true, 'Category');

let that;

/**
  * Category constructor
  * @param {object} category
  * @return {object}
*/
function Category(category) {
  sql.setDialect('mysql');

  this.model = _.extend(category, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'category';
  this.dbConnNew = ConnNew;
  this.sqlTable = sql.define({
    name: this.table,
    columns: [
      'id',
      'name',
      'level',
      'category_id',
      'enabled',
      'dateCreated',
      'dateUpdated',
    ],
  });

  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @param {string} filters <Array>
  * @return {object}
*/
Category.prototype.findAll = (skip, limit, filters) => {
  let query = null;
  if (filters.id) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.id.equals(filters.id))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.keywords && filters.keywords.length > 1) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.name.like(`%${filters.keywords[0]}%`))
      .or(that.sqlTable.name.like(filters.keywords[1] ? `%${filters.keywords[1]}%` : filters.keywords[0]))
      .or(that.sqlTable.name.like(filters.keywords[2] ? `%${filters.keywords[2]}%` : filters.keywords[0]))
      .or(that.sqlTable.name.like(filters.keywords[3] ? `%${filters.keywords[3]}%` : filters.keywords[0]))
      .or(that.sqlTable.name.like(filters.keywords[4] ? `%${filters.keywords[4]}%` : filters.keywords[0]))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else if (filters.keyword) {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .where(that.sqlTable.name.like(`%${filters.keyword}%`))
      .limit(limit)
      .offset(skip)
      .toQuery();
  } else {
    query = that.sqlTable
      .select(that.sqlTable.star())
      .from(that.sqlTable)
      .limit(limit)
      .offset(skip)
      .toQuery();
  }
  log.info(query.text);

  return that.dbConnNew.queryAsync(query.text, query.values);
};

Category.prototype.findStructuredAll = () => new BluePromise((resolve, reject) => {
  const structured = {
    categories: [],
    subCategories: [],
  };
  that.findAll(0, 5000, {})
    .then((results) => {
      if (results.length > 0) {
        structured.categories = _.filter(results, { category_id: 0 });
        _.forEach(structured.categories, (value, key) => {
          structured.categories[key].subCategories = _.filter(results, {
            category_id: value.id,
          });
          _.forEach(structured.categories[key].subCategories, (subValue, subKey) => {
            structured.categories[key].subCategories[subKey].subCategories
            = _.filter(results, { category_id: subValue.id });
          });
        });
        resolve(structured);
      } else {
        reject('Not found');
      }
    })
    .catch((err) => {
      reject(err);
    });
});

/**
  * findById
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Category.prototype.findById = id => that.getByValue(id, 'id');

/**
  * create
  * @return {object/number}
*/
Category.prototype.create = () => new BluePromise((resolve, reject) => {
  that.getByValue(that.model.name, 'name')
    .then((results) => {
      if (results.length === 0) {
        if (that.model.id) {
          delete that.model.id;
        }
        const query = that.sqlTable.insert(that.model).toQuery();
        that.dbConnNew.queryAsync(query.text, query.values)
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
  * Get by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Category.prototype.getByValue = (value, field) => {
  const query = that.sqlTable
    .select(that.sqlTable.star())
    .from(that.sqlTable)
    .where(that.sqlTable[field].equals(value)).toQuery();
  return that.dbConnNew.queryAsync(query.text, query.values);
};

/**
  * Release connection
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Category.prototype.release = () => that.dbConnNew.releaseConnectionAsync();

module.exports = Category;
