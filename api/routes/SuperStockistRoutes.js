const express = require("express");
const router = express.Router();
const {
  getAllSuperStockists,
  getSuperStockist,
  createSuperStockist,
  updateSuperStockist,
  deleteSuperStockist,
} = require("../controller/SuperStockistController");

router.route("/").get(getAllSuperStockists).post(createSuperStockist);

router
  .route("/:id")
  .get(getSuperStockist)
  .patch(updateSuperStockist)
  .delete(deleteSuperStockist);

module.exports = router;
