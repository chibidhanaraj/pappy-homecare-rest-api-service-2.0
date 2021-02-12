const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getRetailerInventory,
  createRetailerNewSku,
  updateRetailerInventory,
} = require('./retailer-sku-inventory.controller');

router.route('/').get(getRetailerInventory).post(protect, createRetailerNewSku);

router.route('/:id').patch(protect, updateRetailerInventory);

module.exports = router;
