const express = require("express");
const router = express.Router();
const {
  getAllRetailers,
  getRetailer,
  createRetailer,
  updateRetailer,
  deleteRetailer,
} = require("../controller/RetailerController");

router.route("/").get(getAllRetailers).post(createRetailer);

router
  .route("/:id")
  .get(getRetailer)
  .patch(updateRetailer)
  .delete(deleteRetailer);

module.exports = router;
