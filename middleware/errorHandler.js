const ErrorResponse = require("../utils/errorResponse");
const { STATUS } = require("../constants/controller.constants");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Mongoose Cast error
  if (err.name === "CastError") {
    const message = `No valid entry found for provided ID ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    status: STATUS.ERROR,
    message: error.message || "Server Error",
    error: error.errorType || "Server Error",
  });
};

module.exports = errorHandler;
