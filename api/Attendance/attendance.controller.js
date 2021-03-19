const mongoose = require('mongoose');
const moment = require('moment');
const AttendanceModel = require('./attendance.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  ATTENDANCE_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { get } = require('lodash');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { ATTENDANCE_AGGREGATE_QUERY } = require('./attendance.utils');

// @desc      Get User Attendance
// @route     GET /api/attendance/?attendance_date
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await AttendanceModel.findOne({
    attendance_date: req.query.attendance_date,
    user: req.userId,
  }).exec();

  if (!attendance) {
    return res.status(200).json({
      status: STATUS.OK,
      message: ATTENDANCE_CONTROLLER_CONSTANTS.ATTENDANCE_NOT_FOUND,
      error: '',
      userAttendance: {},
    });
  }

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(attendance._id),
      },
    },
    ...ATTENDANCE_AGGREGATE_QUERY,
  ];

  const results = await AttendanceModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: ATTENDANCE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    userAttendance: results[0],
  });
});

// @desc      Post attendance
// @route     POST /api/attendance/
exports.createAttendance = asyncHandler(async (req, res, next) => {
  const {
    attendance_date,
    is_present,
    start_time,
    start_location,
    end_time,
    end_location,
    leave_reason,
  } = req.body;

  const newAttendance = new AttendanceModel({
    attendance_date,
    is_present,
    start_time,
    start_location,
    end_time,
    end_location,
    leave_reason,
    user: get(req, 'userId', null),
  });

  const savedAttendanceDocument = await newAttendance.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedAttendanceDocument._id),
      },
    },
    ...ATTENDANCE_AGGREGATE_QUERY,
  ];

  const results = await AttendanceModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: ATTENDANCE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    userAttendance: results[0],
  });
});

// @desc      Post attendance
// @route     PATCH /api/attendance/:id
exports.updateAttendance = asyncHandler(async (req, res, next) => {
  const attendanceId = req.params.id;
  const attendance = await AttendanceModel.findById(attendanceId).exec();

  if (!attendance) {
    return next(
      new ErrorResponse(
        ATTENDANCE_CONTROLLER_CONSTANTS.ATTENDANCE_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['end_time', 'end_location'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${attendanceId}`));
  }

  const dataToUpdate = {};

  if (req.body.end_time) {
    dataToUpdate.end_time = req.body.end_time;
    dataToUpdate.work_duration = moment(req.body.end_time).diff(
      moment(attendance.start_time)
    );
  }

  if (req.body.end_location) {
    dataToUpdate.end_location = req.body.end_location;
  }

  await AttendanceModel.findOneAndUpdate(
    { _id: attendanceId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, attendance) => {
      if (err || !attendance) {
        return next(
          new ErrorResponse(
            ATTENDANCE_CONTROLLER_CONSTANTS.ATTENDANCE_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(attendance.id),
          },
        },
        ...ATTENDANCE_AGGREGATE_QUERY,
      ];

      const results = await AttendanceModel.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: ATTENDANCE_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        userAttendance: results[0],
      });
    }
  );
});
