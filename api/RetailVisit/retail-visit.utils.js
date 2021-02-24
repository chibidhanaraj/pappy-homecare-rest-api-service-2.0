const RETAIL_VISITS_AGGREGATE_QUERY = [
  {
    $lookup: {
      from: 'retailvisits',
      localField: '_id',
      foreignField: 'retailer',
      as: 'retail_visits',
    },
  },
  {
    $unwind: { path: '$retail_visits', preserveNullAndEmptyArrays: true },
  },
  {
    $sort: { 'retail_visits.createdAt': -1 },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'created_by',
      foreignField: '_id',
      as: 'retail_visits.user',
    },
  },
  {
    $unwind: {
      path: '$retail_visits.user',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: '$_id',
      id: {
        $first: '$_id',
      },
      name: {
        $first: '$name',
      },
      retail_visits: {
        $push: {
          $cond: [
            { $gt: ['$retail_visits._id', null] },
            {
              retail_visit_id: '$retail_visits._id',
              visit_result: '$retail_visits.visit_result',
              feedback: '$retail_visits.feedback',
              createdAt: '$retail_visits.createdAt',
              orderTakenBy: '$retail_visits.user.name',
              created_by: '$retail_visits.created_by',
              secondary_order: '$retail_visits.secondary_order',
            },
            '$$REMOVE',
          ],
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
    },
  },
];

const RETAIL_VISIT_AGGREGATE_QUERY = [
  {
    $project: {
      retail_visit_id: '$_id',
      _id: 0,
      retailer: 1,
      visit_result: 1,
      feedback: 1,
    },
  },
];

module.exports = {
  RETAIL_VISITS_AGGREGATE_QUERY,
  RETAIL_VISIT_AGGREGATE_QUERY,
};
