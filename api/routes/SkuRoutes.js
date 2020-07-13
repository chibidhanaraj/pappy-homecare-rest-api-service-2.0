const express = require("express");
const router = express.Router();

const {
  getAllSkus,
  getSku,
  createSku,
  updateSku,
  deleteSku,
} = require("../controller/SkuController");
const { protect, authorize } = require("../../middleware/authHandler");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { ADMIN } = USER_ROLES_CONSTANTS;

router.route("/").get(getAllSkus).post(protect, authorize(ADMIN), createSku);

router
  .route("/:id")
  .get(getSku)
  .put(protect, authorize(ADMIN), updateSku)
  .delete(protect, authorize(ADMIN), deleteSku);

module.exports = router;
