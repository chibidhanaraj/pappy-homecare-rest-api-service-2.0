const ErrorResponse = require('../utils/errorResponse');
const { STATUS } = require('../constants/controller.constants');
const logger = require('../config/winston');
const { ERROR_TYPES } = require('../constants/error.constant');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Mongoose Cast error
  if (err.name === 'CastError') {
    const message = `No valid entry found for provided ID ${err.value}`;
    error = new ErrorResponse(message, 404, ERROR_TYPES.ID_NOT_FOUND);
  }

  if (err.name === 'ValidationError') {
    const message = 'Please provide the required information';

    error = new ErrorResponse(message, 404, ERROR_TYPES.VALIDATION_ERROR);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400, ERROR_TYPES.DUPLICATE_VALUES);
  }

  logger.log({
    level: 'error',
    method: req.method,
    type: error.errorType || ERROR_TYPES.SERVER_ERROR,
    message: err.message || ERROR_TYPES.SERVER_ERROR,
    url: req.originalUrl,
    userId: (req.user && req.user.id) || '',
  });

  res.status(error.statusCode || 500).json({
    status: STATUS.ERROR,
    message: error.message || ERROR_TYPES.SERVER_ERROR,
    error: error.errorType || ERROR_TYPES.SERVER_ERROR,
    validationErrors: error.validationErrors || [],
  });
};

module.exports = errorHandler;
