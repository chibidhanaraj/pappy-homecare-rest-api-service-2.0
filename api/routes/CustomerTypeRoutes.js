const express = require("express");
const router = express.Router();
const {
  getAllCustomerTypes,
  getCustomerType,
  createCustomerType,
  updateCustomerType,
  deleteCustomerType,
} = require("../controller/CustomerTypeController");

router.route("/").get(getAllCustomerTypes).post(createCustomerType);

router
  .route("/:id")
  .get(getCustomerType)
  .put(updateCustomerType)
  .delete(deleteCustomerType);

module.exports = router;
