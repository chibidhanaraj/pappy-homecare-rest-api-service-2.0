const mongoose = require('mongoose');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const UserModel = require('../User/user.model');
const {
  STATUS,
  AUTH_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
// @desc      Get current logged in user
// @route     POST /api/auth/currentUser
// @access    Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);

  res.status(200).json({
    status: true,
    user,
  });
});

const sendAuthToken = (model, statusCode, res) => {
  const token = model.getSignedJwtToken();

  res.status(200).json({
    status: STATUS.OK,
    message: AUTH_CONTROLLER_CONSTANTS.AUTH_SUCCESS,
    error: '',
    token,
  });
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public

exports.login = asyncHandler(async (req, res, next) => {
  const { user_name, password } = req.body;

  const user = await UserModel.findOne({ user_name }).select('+password');
  console.log(user);

  if (!user) {
    return next(
      new ErrorResponse(
        AUTH_CONTROLLER_CONSTANTS.INVALID_CREDENTAILS,
        401,
        ERROR_TYPES.VALIDATION_ERROR,
        [
          {
            location: 'body',
            msg: AUTH_CONTROLLER_CONSTANTS.INVALID_CREDENTAILS,
            param: 'user_name, password',
            value: '',
          },
        ]
      )
    );
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(
      new ErrorResponse(
        AUTH_CONTROLLER_CONSTANTS.INVALID_CREDENTAILS,
        401,
        ERROR_TYPES.VALIDATION_ERROR,
        [
          {
            location: 'body',
            msg: AUTH_CONTROLLER_CONSTANTS.INVALID_CREDENTAILS,
            param: 'user_name, password',
            value: '',
          },
        ]
      )
    );
  }

  sendAuthToken(user, 200, res);
});
