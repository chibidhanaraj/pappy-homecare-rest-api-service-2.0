const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../../middleware/authHandler");
const {
  getAllSecondPrimaryOrders,
  getSecondPrimaryOrder,
  createSecondPrimaryOrder,
  deleteSecondPrimaryOrder,
} = require("../../controller/Orders/SecondPrimaryOrderController");
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
  .get(getAllSecondPrimaryOrders)
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
    createSecondPrimaryOrder
  );

router
  .route("/:id")
  .get(getSecondPrimaryOrder)
  .delete(
    protect,
    authorize(ADMIN, BACKOFFICE_ADMIN),
    deleteSecondPrimaryOrder
  );

module.exports = router;
