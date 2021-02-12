const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllSuperStockists,
  getSuperStockistInventory,
  createSuperStockist,
  updateSuperStockist,
  deleteSuperStockist,
} = require('./super-stockist.controller');

const SuperStockistSkuInventoryRoutes = require('../SuperStockistSkuInventory/super-stockist-sku-inventory.routes');

router.use('/:superStockistId/inventory', SuperStockistSkuInventoryRoutes);

router.route('/').get(getAllSuperStockists).post(protect, createSuperStockist);

router
  .route('/:id')
  .patch(protect, updateSuperStockist)
  .delete(deleteSuperStockist);

module.exports = router;
