const BluePromise = require('bluebird');
const lodash = require('lodash');
const Conn = require('../../service/connection');
const Query = require('../../service/query');
// const Util = require('../helpers/util');

let that;

/**
  * Category constructor
  * @param {object} category
  * @return {object}
*/
function Category(category) {
  this.model = lodash.extend(category, {
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  });
  this.table = 'category';
  this.dbConn = BluePromise.promisifyAll(new Conn({ tableName: this.table }));

  that = this;
}

/**
  * findAll
  * @param {string} limit
  * @param {string} offset
  * @return {object}
*/
Category.prototype.findAll = (offset, limit) => that.dbConn.queryAsync(Query.composeQuery(that.table, ['id', 'name'], null, limit, offset));

Category.prototype.findStructuredAll = () => new BluePromise((resolve, reject) => {
  const structured = {
    categories: {},
    subCategories: {},
  };
  that.findAll(0, 5000)
    .then((results) => {
      if (results.length > 0) {
        lodash.forEach(results, (value) => {
          if (parseInt(value.level, 10) === 1) {
            structured.categories[`cat-${value.id}`] = {
              id: value.id,
              name: value.name,
            };
          } else if (parseInt(value.level, 10) === 2) {
            structured.subCategories[`subCat-${value.id}`] = {
              id: value.id,
              name: value.name,
            };
          } else {
            structured.subCategories[`subCat-${value.category_id}`][`subFilter-${value.id}`] = {
              id: value.id,
              name: value.name,
            };
          }
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
        const DbModel = Conn.extend({ tableName: that.table });
        that.dbConn = BluePromise.promisifyAll(new DbModel(that.model));
        that.dbConn.saveAsync()
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
  * Get sellerAccount by value
  * @param {any} value
  * @param {string} field
  * @return {object<Promise>}
*/
Category.prototype.getByValue = (value, field) => that.dbConn.findAsync('all', { where: `${field} = '${value}'` });

module.exports = Category;
