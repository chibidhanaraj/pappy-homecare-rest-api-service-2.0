const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllSkus,
  createSku,
  updateSku,
  deleteSku,
} = require('./sku.controller');

router.route('/').get(getAllSkus).post(protect, createSku);

router.route('/:id').patch(protect, updateSku).delete(deleteSku);

module.exports = router;
