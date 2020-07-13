const express = require("express");
const router = express.Router();
const {
  getAllSuperStockists,
  getSuperStockist,
  createSuperStockist,
  updateSuperStockist,
  deleteSuperStockist,
} = require("../controller/SuperStockistController");
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
  .get(getAllSuperStockists)
  .post(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER
    ),
    createSuperStockist
  );

router
  .route("/:id")
  .get(getSuperStockist)
  .patch(
    protect,
    authorize(
      ADMIN,
      BACKOFFICE_ADMIN,
      GENERAL_MANAGER,
      REGIONAL_SALES_MANAGER,
      AREA_SALES_MANAGER
    ),
    updateSuperStockist
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
    deleteSuperStockist
  );

module.exports = router;
