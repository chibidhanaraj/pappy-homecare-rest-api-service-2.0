const express = require("express");
const router = express.Router();
const {
  getAllWholeSalers,
  getWholeSaler,
  createWholeSaler,
  updateWholeSaler,
  deleteWholeSaler,
} = require("../controller/WholeSalerController");

router.route("/").get(getAllWholeSalers).post(createWholeSaler);

router
  .route("/:id")
  .get(getWholeSaler)
  .patch(updateWholeSaler)
  .delete(deleteWholeSaler);

module.exports = router;
