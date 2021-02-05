const ZONE_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'districts',
      localField: '_id',
      foreignField: 'zone',
      as: 'districts',
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: '$name',
      districtsCount: { $size: '$districts' },
    },
  },
  { $sort: { name: 1 } },
];

module.exports = {
  ZONE_AGGREGATE_QUERY,
};
