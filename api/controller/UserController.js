const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const UserModel = require("../model/UserModel");

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
  const user = new UserModel({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    mobileNumber: req.body.mobileNumber,
    password: req.body.password,
    role: req.body.role,
  });

  const createdUser = await UserModel.findOne({
    mobileNumber: user.mobileNumber,
  });

  if (createdUser) {
    return next(
      new ErrorResponse(`${user.mobileNumber} has already been created`, 400)
    );
  }

  const savedDocument = await user.save();
  res.status(201).json({
    success: true,
    user: {
      name: savedDocument.name,
      mobileNumber: savedDocument.mobileNumber,
      role: savedDocument.role,
    },
  });
});

// @desc      Update user
// @route     PUT /api/user/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ["name", "mobileNumber", "password", "role"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${userId}`));
  }

  const user = await UserModel.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc      Delete user
// @route     DELETE /api/user/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id).exec();

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
