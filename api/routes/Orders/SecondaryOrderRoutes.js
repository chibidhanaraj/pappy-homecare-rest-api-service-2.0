const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../../middleware/authHandler");
const {
  getAllSecondaryOrders,
  getSecondaryOrder,
  createSecondaryOrder,
  deleteSecondaryOrder,
} = require("../../controller/Orders/SecondaryOrderController");
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
  .get(getAllSecondaryOrders)
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
    createSecondaryOrder
  );

router
  .route("/:id")
  .get(getSecondaryOrder)
  .delete(protect, authorize(ADMIN, BACKOFFICE_ADMIN), deleteSecondaryOrder);

module.exports = router;
