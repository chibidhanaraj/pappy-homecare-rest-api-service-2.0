const express = require("express");
const router = express.Router();
const {
  getAllBeatAreas,
  getBeatArea,
  createBeatArea,
  updateBeatArea,
  deleteBeatArea,
} = require("../controller/BeatAreaController");
const { protect, authorize } = require("../../middleware/authHandler");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const {
  ADMIN,
  BACKOFFICE_ADMIN,
  GENERAL_MANAGER,
  REGIONAL_SALES_MANAGER,
  AREA_SALES_MANAGER,
  SALES_OFFICER,
  TERRITORY_SALES_INCHARGE,
} = USER_ROLES_CONSTANTS;

router
  .route("/")
  .get(getAllBeatAreas)
  .post(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER,
      SALES_OFFICER,
      TERRITORY_SALES_INCHARGE
    ),
    createBeatArea
  );

router
  .route("/:id")
  .get(getBeatArea)
  .patch(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER,
      SALES_OFFICER,
      TERRITORY_SALES_INCHARGE
    ),
    updateBeatArea
  )
  .delete(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER,
      SALES_OFFICER,
      TERRITORY_SALES_INCHARGE
    ),
    deleteBeatArea
  );

module.exports = router;
