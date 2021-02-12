const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getSuperStockistInventory,
  createSuperStockistNewSku,
  updateSuperStockistInventory,
} = require('./super-stockist-sku-inventory.controller');

router
  .route('/')
  .get(getSuperStockistInventory)
  .post(protect, createSuperStockistNewSku);

router.route('/:id').patch(protect, updateSuperStockistInventory);

module.exports = router;
