const express = require("express");
const router = express.Router();
const {
  getAllRetailers,
  getRetailer,
  createRetailer,
  updateRetailer,
  deleteRetailer,
} = require("../controller/RetailerController");
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
  .get(getAllRetailers)
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
    createRetailer
  );

router
  .route("/:id")
  .get(getRetailer)
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
    updateRetailer
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
    deleteRetailer
  );

module.exports = router;
