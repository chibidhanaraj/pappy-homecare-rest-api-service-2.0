const ATTENDANCE_AGGREGATE_QUERY = [
  {
    $project: {
      attendance_id: '$_id',
      _id: 0,
      is_present: 1,
      attendance_date: 1,
      start_time: 1,
      start_location: 1,
      end_time: 1,
      end_location: 1,
      leave_reason: 1,
      user: 1,
    },
  },
];

module.exports = {
  ATTENDANCE_AGGREGATE_QUERY,
};
