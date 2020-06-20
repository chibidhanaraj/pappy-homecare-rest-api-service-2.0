const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  updateCategoryProperties,
  deleteCategory,
  deleteCategoryProperties,
} = require("../controller/CategoryController");

router.route("/").get(getAllCategories).post(createCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

router
  .route("/:id/update")
  .put(updateCategoryProperties)
  .delete(deleteCategoryProperties);

module.exports = router;
