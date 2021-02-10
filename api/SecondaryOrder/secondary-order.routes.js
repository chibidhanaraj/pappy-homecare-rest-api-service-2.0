const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllSecondaryOrders,
  getSecondaryOrder,
  createSecondaryOrder,
  updateSecondaryOrder,
  deleteSecondaryOrder,
} = require('./secondary-order.controller');

router
  .route('/')
  .get(getAllSecondaryOrders)
  .post(protect, createSecondaryOrder);

router
  .route('/:id')
  .get(getSecondaryOrder)
  .patch(updateSecondaryOrder)
  .delete(deleteSecondaryOrder);

module.exports = router;
