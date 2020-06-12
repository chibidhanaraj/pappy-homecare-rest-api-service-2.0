const express = require("express");
const router = express.Router();
const {
  getAllAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea,
} = require("../controller/AreaController");

router.route("/").get(getAllAreas).post(createArea);

router.route("/:id").get(getArea).patch(updateArea).delete(deleteArea);

module.exports = router;
