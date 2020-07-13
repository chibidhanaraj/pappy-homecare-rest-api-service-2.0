const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middleware/validators/UserValidator");
const { protect, authorize } = require("../../middleware/authHandler");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { ADMIN, BACKOFFICE_ADMIN } = USER_ROLES_CONSTANTS;

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controller/UserController");

router
  .route("/")
  .get(getAllUsers)
  .post(protect, authorize(ADMIN, BACKOFFICE_ADMIN), validateUser, createUser);

router
  .route("/:id")
  .get(getUser)
  .patch(protect, authorize(ADMIN, BACKOFFICE_ADMIN), updateUser)
  .delete(protect, authorize(ADMIN, BACKOFFICE_ADMIN), deleteUser);

module.exports = router;
