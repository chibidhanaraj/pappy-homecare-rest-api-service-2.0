const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllDistributors,
  createDistributor,
  updateDistributor,
  deleteDistributor,
} = require('./distributor.controller');

const DistributorInventoryRoutes = require('../DistributorSkuInventory/distributor-sku-inventory.routes');

router.use('/:distributorId/inventory', DistributorInventoryRoutes);

router.route('/').get(getAllDistributors).post(protect, createDistributor);

router
  .route('/:id')
  .patch(protect, updateDistributor)
  .delete(deleteDistributor);

module.exports = router;
