const Item = {
  getAllView(items, filters) {
    return items.viewAsync('designItem', 'list-all', filters);
  },
};

module.exports = Item;
