const express = require("express");
const router = express.Router();
const ProductModel = require("../model/ProductModel");
const mongoose = require("mongoose");

const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/ProductController");

router.route("/").get(getAllProducts).post(createProduct);

router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
