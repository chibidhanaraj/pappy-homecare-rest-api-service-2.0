const express = require("express");
const router = express.Router();

const {
  getAllSkus,
  getSku,
  createSku,
  updateSku,
  deleteSku,
} = require("../controller/SkuController");

router.route("/").get(getAllSkus).post(createSku);

router.route("/:id").get(getSku).put(updateSku).delete(deleteSku);

module.exports = router;
