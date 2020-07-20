const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../../middleware/authHandler");
const {
  getAllPrimaryOrders,
  getPrimaryOrder,
  createPrimaryOrder,
  updatePrimaryOrder,
  deletePrimaryOrder,
} = require("../../controller/Orders/PrimaryOrderController");
const { USER_ROLES_CONSTANTS } = require("../../../constants/constants");
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
  .get(getAllPrimaryOrders)
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
    createPrimaryOrder
  );

router
  .route("/:id")
  .get(getPrimaryOrder)
  .delete(protect, authorize(ADMIN, BACKOFFICE_ADMIN), deletePrimaryOrder);

module.exports = router;
