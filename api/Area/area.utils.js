const AREA_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'districts',
      localField: 'district',
      foreignField: '_id',
      as: 'district',
    },
  },
  {
    $unwind: { path: '$district', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'zones',
      localField: 'district.zone',
      foreignField: '_id',
      as: 'zone',
    },
  },
  {
    $unwind: { path: '$zone', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'beats',
      localField: '_id',
      foreignField: 'area',
      as: 'beats',
    },
  },
  {
    $project: {
      id: '$_id',
      _id: 0,
      name: '$name',
      'district.id': '$district._id',
      'district.name': '$district.name',
      'zone.id': '$zone._id',
      'zone.name': '$zone.name',
      beatsCount: { $size: '$beats' },
    },
  },
  { $sort: { name: 1 } },
];

module.exports = {
  AREA_AGGREGATE_QUERY,
};
