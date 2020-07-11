const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../../utils/errorResponse");
const { ERROR_TYPES } = require("../../constants/error.constant");

exports.validateAuth = [
  check("employeeId", "Please include a valid Username")
    .notEmpty()
    .withMessage("Username cannot be empty")
    .bail()
    .isLength({ min: 4 })
    .withMessage("EmployeeId should be length of 4"),
  check("password").notEmpty().withMessage("Password cannot be empty"),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new ErrorResponse(
          `Validation Error`,
          422,
          ERROR_TYPES.VALIDATION_ERROR,
          errors.array()
        )
      );
    }
    next();
  },
];
