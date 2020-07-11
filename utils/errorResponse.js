class ErrorResponse extends Error {
  constructor(message, statusCode, errorType, validationErrors) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.validationErrors = validationErrors && validationErrors.length > 0 ? validationErrors : [];
  }
}

module.exports = ErrorResponse;
