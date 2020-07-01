class ErrorResponse extends Error {
  constructor(message, statusCode, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

module.exports = ErrorResponse;
