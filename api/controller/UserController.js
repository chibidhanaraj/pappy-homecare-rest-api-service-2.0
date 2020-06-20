const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const UserModel = require("../model/UserModel");
const ZoneModel = require("../model/ZoneModel");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { areObjectIdEqualArrays } = require("../../utils/CommonUtils");

// @desc      Get all users
// @route     GET /api/user
// @access    Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModel.find().exec();

  res.json({
    success: true,
    users,
  });
});

// @desc      Get single user
// @route     GET /api/user/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id);

  if (!user) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc      Create user
// @route     POST /api/user
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    mobileNumber,
    password,
    role,
    isReportingToAdmin,
    reportingTo,
    zones,
    districts,
    areas,
  } = req.body;

  const user = new UserModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    mobileNumber,
    password,
    role,
    isReportingToAdmin,
    reportingTo,
    zones,
    districts,
    areas,
  });

  const createdUser = await UserModel.findOne({
    mobileNumber: mobileNumber,
  });

  if (createdUser) {
    return next(
      new ErrorResponse(`${mobileNumber} has already been created`, 400)
    );
  }

  if (!isReportingToAdmin && reportingTo) {
    const reportingToUser = await UserModel.findOne({
      _id: reportingTo,
    });

    if (!reportingToUser) {
      return next(new ErrorResponse(`${reportingToUser} does not exist`, 400));
    }
  }

  const savedUserDocument = await user.save();

  res.status(201).json({
    success: true,
    user: savedUserDocument,
  });
});

// @desc      Update user
// @route     PUT /api/user/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const user = await UserModel.findById(userId).exec();

  if (!user) {
    return next(
      new ErrorResponse(`No valid entry found for provided ID ${userId}`, 404)
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "name",
    "mobileNumber",
    "role",
    "isReportingToAdmin",
    "reportingTo",
    "zones",
    "districts",
    "areas",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${userId}`));
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
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
      new ErrorResponse(`No valid entry found for provided ID ${id}`, 404)
    );
  }

  await UserModel.findByIdAndDelete(id).exec();

  res.status(200).json({
    success: true,
    data: {},
  });
});
