const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authHandler");
const {
  getAllZones,
  getZone,
  createZone,
  updateZone,
  deleteZone,
} = require("../controller/ZoneController");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER } = USER_ROLES_CONSTANTS;

router
  .route("/")
  .get(getAllZones)
  .post(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER),
    createZone
  );

router
  .route("/:id")
  .get(getZone)
  .patch(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER),
    updateZone
  )
  .delete(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN, GENERAL_MANAGER),
    deleteZone
  );

module.exports = router;
