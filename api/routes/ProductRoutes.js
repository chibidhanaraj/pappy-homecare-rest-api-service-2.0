const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/ProductController");
const { protect, authorize } = require("../../middleware/authHandler");
const { USER_ROLES_CONSTANTS } = require("../../constants/constants");
const { ADMIN } = USER_ROLES_CONSTANTS;

router
  .route("/")
  .get(getAllProducts)
  .post(protect, authorize(ADMIN), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .patch(protect, authorize(ADMIN), updateProduct)
  .delete(protect, authorize(ADMIN), deleteProduct);

module.exports = router;
