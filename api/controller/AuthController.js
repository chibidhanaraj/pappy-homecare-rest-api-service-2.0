const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const UserModel = require("../model/UserModel");
// @desc      Get current logged in user
// @route     POST /api/auth/currentUser
// @access    Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

const sendAuthToken = (model, statusCode, res) => {
  const token = model.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public

exports.login = asyncHandler(async (req, res, next) => {
  const { mobileNumber, password } = req.body;

  // Validate
  if (!mobileNumber || !password) {
    return next(
      new ErrorResponse("Please provide the username and password", 400)
    );
  }

  const user = await UserModel.findOne({ mobileNumber }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendAuthToken(user, 200, res);
  res.json({
    success: true,
    isMatch,
    token,
  });
});
