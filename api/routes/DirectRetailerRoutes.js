const express = require("express");
const router = express.Router();
const {
  getAllDirectRetailers,
  getDirectRetailer,
  createDirectRetailer,
  updateDirectRetailer,
  deleteDirectRetailer,
} = require("../controller/DirectRetailerController");

router.route("/").get(getAllDirectRetailers).post(createDirectRetailer);

router
  .route("/:id")
  .get(getDirectRetailer)
  .patch(updateDirectRetailer)
  .delete(deleteDirectRetailer);

module.exports = router;
