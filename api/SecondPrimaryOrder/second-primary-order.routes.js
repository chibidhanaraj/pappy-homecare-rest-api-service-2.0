const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllSecondPrimaryOrders,
  getSecondPrimaryOrder,
  createSecondPrimaryOrder,
  updateSecondPrimaryOrder,
  deleteSecondPrimaryOrder,
} = require('./second-primary-order.controller');

router
  .route('/')
  .get(getAllSecondPrimaryOrders)
  .post(protect, createSecondPrimaryOrder);

router
  .route('/:id')
  .get(getSecondPrimaryOrder)
  .patch(updateSecondPrimaryOrder)
  .delete(deleteSecondPrimaryOrder);

module.exports = router;
