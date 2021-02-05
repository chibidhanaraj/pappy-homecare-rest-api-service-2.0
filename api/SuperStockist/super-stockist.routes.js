const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllSuperStockists,
  createSuperStockist,
  updateSuperStockist,
  deleteSuperStockist,
} = require('./super-stockist.controller');

router.route('/').get(getAllSuperStockists).post(protect, createSuperStockist);

router
  .route('/:id')
  .patch(protect, updateSuperStockist)
  .delete(deleteSuperStockist);

module.exports = router;
