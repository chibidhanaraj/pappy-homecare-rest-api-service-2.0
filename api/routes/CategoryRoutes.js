const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/CategoryController");

router.route("/").get(getAllCategories).post(createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
