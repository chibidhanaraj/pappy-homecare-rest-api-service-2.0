const DISTRICT_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'zones',
      localField: 'zone',
      foreignField: '_id',
      as: 'zone',
    },
  },
  {
    $unwind: { path: '$zone', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'areas',
      localField: '_id',
      foreignField: 'district',
      as: 'areas',
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: '$name',
      'zone.id': '$zone._id',
      'zone.name': '$zone.name',
      areasCount: { $size: '$areas' },
    },
  },
  { $sort: { name: 1 } },
];

module.exports = {
  DISTRICT_AGGREGATE_QUERY,
};
