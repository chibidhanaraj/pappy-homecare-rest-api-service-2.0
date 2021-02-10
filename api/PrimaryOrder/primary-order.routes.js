const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllPrimaryOrders,
  getPrimaryOrder,
  createPrimaryOrder,
  updatePrimaryOrder,
  deletePrimaryOrder,
} = require('./primary-order.controller');

router.route('/').get(getAllPrimaryOrders).post(protect, createPrimaryOrder);

router
  .route('/:id')
  .get(getPrimaryOrder)
  .patch(updatePrimaryOrder)
  .delete(deletePrimaryOrder);

module.exports = router;
