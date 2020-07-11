const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../../utils/errorResponse");
const { ERROR_TYPES } = require("../../constants/error.constant");

exports.validateUser = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("User name can not be empty!")
    .bail()
    .isAlpha()
    .withMessage("Must be only alphabetical chars"),
  check("employeeId")
    .notEmpty()
    .withMessage("EmployeeId is required")
    .bail()
    .isLength({ min: 4 })
    .withMessage("EmployeeId should be length of 4"),
  check("mobileNumber", "Must provide a valid IN phone number.").isMobilePhone([
    "en-IN",
  ]),
  check(
    "password",
    "Please enter a password with 5 or more characters"
  ).isLength({ min: 5 }),
  check("role")
    .notEmpty()
    .withMessage("Role is required")
    .bail()
    .isIn([
      "ADMIN",
      "BACKOFFICE_ADMIN",
      "GENERAL_MANAGER",
      "REGIONAL_SALES_MANAGER",
      "AREA_SALES_MANAGER",
      "SALES_OFFICER",
      "TERRITORY_SALES_INCHARGE",
    ])
    .withMessage("UserType does not match"),
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
