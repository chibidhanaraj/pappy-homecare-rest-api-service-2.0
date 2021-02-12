const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getDistributorInventory,
  createDistributorNewSku,
  updateDistributorInventory,
} = require('./distributor-sku-inventory.controller');

router
  .route('/')
  .get(getDistributorInventory)
  .post(protect, createDistributorNewSku);

router.route('/:id').patch(protect, updateDistributorInventory);

module.exports = router;
