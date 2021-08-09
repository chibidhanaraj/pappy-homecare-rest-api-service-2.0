const mongoose = require('mongoose');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const UserModel = require('./user.model');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  STATUS,
  USER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { get } = require('lodash');
const { USERS_ATTENDANCE_BY_DATE_AGGREGATE_QUERY } = require('./user.utils');

// @desc      Get all users
// @route     GET /api/user
// @access    Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModel.find().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: USER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    users,
  });
});

// @desc      Get all users attendances
// @route     GET /api/user/attendance
// @access    Private/Admin
exports.getAllUsersAttendance = asyncHandler(async (req, res, next) => {
  const query = USERS_ATTENDANCE_BY_DATE_AGGREGATE_QUERY(
    req.query.attendance_date,
    req.query.user
  );

  const results = await UserModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: USER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    attendances: results,
  });
});

// @desc      Get single user
// @route     GET /api/user/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id).select('-password');

  if (!user) {
    return next(
      new ErrorResponse(
        USER_CONTROLLER_CONSTANTS.USER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: USER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    user,
  });
});

// @desc      Create user
// @route     POST /api/user
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    user_name,
    mobile_number,
    password,
    role,
    allowed_apps,
    assigned_beats,
    restrict_by_territory,
  } = req.body;
  const userReq = req.user;

  const user = new UserModel({
    name,
    user_name,
    mobile_number,
    password,
    role,
    createdBy: get(userReq, 'id', null),
    updatedBy: get(userReq, 'id', null),
    allowed_apps,
    assigned_beats,
    restrict_by_territory,
  });

  const createdUser = await UserModel.findOne({
    user_name: user_name,
  });

  if (createdUser) {
    return next(
      new ErrorResponse(
        USER_CONTROLLER_CONSTANTS.USER_DUPLICATE_USERNAME.replace(
          '{{name}}',
          user_name
        ),
        400,
        ERROR_TYPES.DUPLICATE_USER
      )
    );
  }

  const savedUserDocument = await user.save();

  res.status(201).json({
    status: STATUS.OK,
    message: USER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    user: savedUserDocument,
  });
});

// @desc      Update user
// @route     PUT /api/user/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  console.log(userId);

  const user = await UserModel.findById(userId).exec();

  console.log(user);
  if (!user) {
    return next(
      new ErrorResponse(
        USER_CONTROLLER_CONSTANTS.USER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'employeeId',
    'mobileNumber',
    'role',
    'assigned_beats',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${userId}`));
  }

  const dataToUpdate = {
    ...req.body,
  };

  const updatedUser = await UserModel.findByIdAndUpdate(userId, dataToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: true,
    user: updatedUser,
  });
});

// @desc      Delete user
// @route     DELETE /api/user/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id).exec();
  const { role: userRole, zones: userZones } = user;

  if (!user) {
    return next(
      new ErrorResponse(
        USER_CONTROLLER_CONSTANTS.USER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await UserModel.findByIdAndDelete(id).exec();

  res.status(200).json({
    status: true,
    user: {},
  });
});
