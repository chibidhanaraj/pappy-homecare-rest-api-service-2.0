const express = require("express");
const router = express.Router();
const {
  getAllDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require("../controller/DistrictController");

router.route("/").get(getAllDistricts).post(createDistrict);

router
  .route("/:id")
  .get(getDistrict)
  .patch(updateDistrict)
  .delete(deleteDistrict);

module.exports = router;
