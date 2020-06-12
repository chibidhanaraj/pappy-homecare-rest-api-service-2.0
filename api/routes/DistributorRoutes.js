const express = require("express");
const router = express.Router();
const {
  getAllDistributors,
  getDistributor,
  createDistributor,
  updateDistributor,
  deleteDistributor,
} = require("../controller/DistributorController");

router.route("/").get(getAllDistributors).post(createDistributor);

router
  .route("/:id")
  .get(getDistributor)
  .patch(updateDistributor)
  .delete(deleteDistributor);

module.exports = router;
