const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllRetailers,
  createRetailer,
  updateRetailer,
  deleteRetailer,
} = require('./retailer.controller');

const RetailerInventoryRoutes = require('../RetailerSkuInventory/retailer-sku-inventory.routes');

/* Redirect to Retailer Sku Inventory Router */
router.use('/:retailerId/inventory', RetailerInventoryRoutes);

router.route('/').get(getAllRetailers).post(protect, createRetailer);

router.route('/:id').patch(protect, updateRetailer).delete(deleteRetailer);

module.exports = router;
