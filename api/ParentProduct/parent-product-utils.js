const PARENT_PRODUCT_NAME_ONLY_AGGREGATE_QUERY = [
  {
    $project: {
      id: '$_id',
      _id: 0,
      brand: 1,
      name: 1,
      carton_box_stock: 1,
      product_container_stock: 1,
    },
  },
];

module.exports = {
  PARENT_PRODUCT_NAME_ONLY_AGGREGATE_QUERY,
};
