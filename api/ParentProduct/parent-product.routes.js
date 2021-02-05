const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllParentProducts,
  createParentProduct,
  updateParentProduct,
  deleteParentProduct,
} = require('./parent-product.controller');
const ParentProductModel = require('./parent-product.model');
const advancedResults = require('../../middleware/advancedResults');

router
  .route('/')
  .get(advancedResults(ParentProductModel), getAllParentProducts)
  .post(protect, createParentProduct);

router
  .route('/:id')
  .patch(protect, updateParentProduct)
  .delete(deleteParentProduct);

module.exports = router;
