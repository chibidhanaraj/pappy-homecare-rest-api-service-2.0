const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllDistributors,
  createDistributor,
  updateDistributor,
  deleteDistributor,
  getDistributorInventory,
} = require('./distributor.controller');

router.route('/').get(getAllDistributors).post(protect, createDistributor);

router
  .route('/:id')
  .patch(protect, updateDistributor)
  .delete(deleteDistributor);

router.route('/:id/inventory').get(getDistributorInventory);

module.exports = router;
