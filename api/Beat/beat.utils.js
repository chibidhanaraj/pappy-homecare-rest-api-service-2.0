const BEAT_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'areas',
      localField: 'area',
      foreignField: '_id',
      as: 'area',
    },
  },
  {
    $unwind: { path: '$area', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'districts',
      localField: 'area.district',
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
    $project: {
      id: '$_id',
      _id: 0,
      name: '$name',
      'area.id': '$area._id',
      'area.name': '$area.name',
      'district.id': '$district._id',
      'district.name': '$district.name',
      'zone.id': '$zone._id',
      'zone.name': '$zone.name',
    },
  },
  { $sort: { name: 1 } },
];

module.exports = {
  BEAT_AGGREGATE_QUERY,
};
