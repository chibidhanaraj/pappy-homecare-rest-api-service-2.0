const mongoose = require('mongoose');

const USERS_ATTENDANCE_BY_DATE_AGGREGATE_QUERY = (date, user) => {
  const matchUserQuery = {};

  if (user) {
    matchUserQuery._id = mongoose.Types.ObjectId(user);
  }

  const matchAttendanceQuery = {
    'attendance.is_present': true,
  };

  if (date) {
    matchAttendanceQuery['attendance.attendance_date'] = new Date(date);
  }

  return [
    {
      $match: matchUserQuery,
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'user',
        as: 'attendance',
      },
    },
    {
      $unwind: { path: '$attendance', preserveNullAndEmptyArrays: true },
    },
    {
      $match: matchAttendanceQuery,
    },
    {
      $project: {
        attendance_id: '$attendance._id',
        user_id: '$_id',
        _id: 0,
        role: 1,
        employee_name: '$name',
        'attendance.is_present': '$attendance.is_present',
        'attendance.attendance_date': '$attendance.attendance_date',
        'attendance.start_time': '$attendance.start_time',
        'attendance.start_location': '$attendance.start_location',
        'attendance.end_time': '$attendance.end_time',
        'attendance.end_location': '$attendance.end_location',
        'attendance.work_duration': '$attendance.work_duration',
      },
    },
    {
      $sort: {
        'attendance.attendance_date': -1,
        'attendance.start_time': 1,
      },
    },
  ];
};

module.exports = {
  USERS_ATTENDANCE_BY_DATE_AGGREGATE_QUERY,
};
