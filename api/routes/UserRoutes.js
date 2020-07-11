const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middleware/validators/UserValidator");

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controller/UserController");

router.route("/").get(getAllUsers).post(validateUser, createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
