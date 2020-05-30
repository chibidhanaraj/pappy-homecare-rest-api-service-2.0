const express = require("express");
const router = express.Router();
const {
  getAllZones,
  getZone,
  createZone,
  updateZone,
  deleteZone,
} = require("../controller/ZoneController");

router.route("/").get(getAllZones).post(createZone);

router.route("/:id").get(getZone).patch(updateZone).delete(deleteZone);

module.exports = router;
