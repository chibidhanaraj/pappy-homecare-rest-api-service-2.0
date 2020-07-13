const express = require("express");
const router = express.Router();
const {
  getAllDistributors,
  getDistributor,
  createDistributor,
  updateDistributor,
  deleteDistributor,
} = require("../controller/DistributorController");
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
  .get(getAllDistributors)
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
    createDistributor
  );

router
  .route("/:id")
  .get(getDistributor)
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
    updateDistributor
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
    deleteDistributor
  );

module.exports = router;
