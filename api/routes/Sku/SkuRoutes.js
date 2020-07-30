const express = require('express');
const router = express.Router();
const ComboSkuRoutes = require('./ComboSkuRoutes');
const {
  getAllSkus,
  getSku,
  createSku,
  updateSku,
  deleteSku,
} = require('../../controller/Sku/SkuController');
const { protect, authorize } = require('../../../middleware/authHandler');
const { USER_ROLES_CONSTANTS } = require('../../../constants/constants');
const { ADMIN } = USER_ROLES_CONSTANTS;

router.use('/combo', ComboSkuRoutes);

router.route('/').get(getAllSkus).post(protect, authorize(ADMIN), createSku);

router
  .route('/:id')
  .get(getSku)
  .patch(protect, authorize(ADMIN), updateSku)
  .delete(protect, authorize(ADMIN), deleteSku);

module.exports = router;
