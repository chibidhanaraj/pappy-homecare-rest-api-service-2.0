const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const UserModel = require("../model/UserModel");
const { ERROR_TYPES } = require("../../constants/error.constant");
const {
  STATUS,
  USER_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");

// @desc      Get all users
// @route     GET /api/user
// @access    Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModel.find().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: USER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    users,
  });
});

// @desc      Get single user
// @route     GET /api/user/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id).select("-password");

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
    error: "",
    user,
  });
});

// @desc      Create user
// @route     POST /api/user
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, employeeId, mobileNumber, password, role } = req.body;

  const user = new UserModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    employeeId,
    mobileNumber,
    password,
    role,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const createdUser = await UserModel.findOne({
    employeeId: employeeId,
  });

  if (createdUser) {
    return next(
      new ErrorResponse(
        USER_CONTROLLER_CONSTANTS.USER_DUPLICATE_EMPLOYEEID.replace(
          "{{employeeId}}",
          employeeId
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
    error: "",
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
      new ErrorResponse(
        USER_CONTROLLER_CONSTANTS.USER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    "name",
    "employeeId",
    "mobileNumber",
    "role",
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${userId}`));
  }

  const dataToUpdate = {
    updatedBy: req.user.id || "",
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
