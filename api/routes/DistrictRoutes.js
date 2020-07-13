const express = require("express");
const router = express.Router();
const {
  getAllDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require("../controller/DistrictController");
const { protect, authorize } = require("../../middleware/authHandler");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER } = USER_ROLES_CONSTANTS;

router
  .route("/")
  .get(getAllDistricts)
  .post(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER),
    createDistrict
  );

router
  .route("/:id")
  .get(getDistrict)
  .patch(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER),
    updateDistrict
  )
  .delete(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER),
    deleteDistrict
  );

module.exports = router;
