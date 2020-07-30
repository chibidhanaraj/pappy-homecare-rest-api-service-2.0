const express = require('express');
const router = express.Router();

const {
  getComboSku,
  createComboSku,
  updateComboSku,
  deleteComboSku,
} = require('../../controller/Sku/ComboSkuController');
const { protect, authorize } = require('../../../middleware/authHandler');
const { USER_ROLES_CONSTANTS } = require('../../../constants/constants');
const { ADMIN } = USER_ROLES_CONSTANTS;

router.route('/').post(protect, authorize(ADMIN), createComboSku);

router
  .route('/:id')
  .get(getComboSku)
  .patch(protect, authorize(ADMIN), updateComboSku)
  .delete(protect, authorize(ADMIN), deleteComboSku);

module.exports = router;
