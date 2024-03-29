const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const UserModel = require('../api/User/user.model');
const { ERROR_TYPES } = require('../constants/error.constant');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;

  if (authorization && authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = authorization.replace('Bearer ', '');
  }

  // Make sure token exists
  if (!token) {
    return next(
      new ErrorResponse(
        'Not authorized to access this route',
        401,
        'Auth Error'
      )
    );
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: 'Token is not valid' });
      } else {
        req.user = await UserModel.findById(decoded.id);

        if (!req.user || req.user.is_inactive) {
          return next(
            new ErrorResponse(
              'User does not exist',
              401,
              ERROR_TYPES.UNAUTHORIZED
            )
          );
        }

        req.userId = decoded.id;
        next();
      }
    });
  } catch (err) {
    return next(
      new ErrorResponse(
        'Not authorized to access this route',
        401,
        'Auth Error'
      )
    );
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `You are not authorized to access this route`,
          403,
          'Auth Error'
        )
      );
    }
    next();
  };
};
