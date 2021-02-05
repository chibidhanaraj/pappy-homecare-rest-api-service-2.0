const PARENT_PRODUCT_NAME_ONLY_AGGREGATE_QUERY = [
  {
    $project: {
      id: '$_id',
      _id: 0,
      brand: 1,
      name: 1,
    },
  },
];

module.exports = {
  PARENT_PRODUCT_NAME_ONLY_AGGREGATE_QUERY,
};
