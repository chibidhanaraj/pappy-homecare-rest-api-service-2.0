const express = require("express");
const router = express.Router();
const {
  getAllAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea,
} = require("../controller/AreaController");
const { protect, authorize } = require("../../middleware/authHandler");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const {
  ADMIN,
  BACKOFFICE_ADMIN,
  GENERAL_MANAGER,
  REGIONAL_SALES_MANAGER,
  AREA_SALES_MANAGER,
} = USER_ROLES_CONSTANTS;

router
  .route("/")
  .get(getAllAreas)
  .post(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER
    ),
    createArea
  );

router
  .route("/:id")
  .get(getArea)
  .patch(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER
    ),
    updateArea
  )
  .delete(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER
    ),
    deleteArea
  );

module.exports = router;
