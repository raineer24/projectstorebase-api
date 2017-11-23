"use strict";

/*
  * listItems
*/
function getAllView (items, filters) {
  return items.viewAsync('designItem', 'list-all');
}

module.exports = {
  getAllView: getAllView
};
