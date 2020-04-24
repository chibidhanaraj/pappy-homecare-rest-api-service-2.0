const express = require("express");
const router = express.Router();
const {
  getAllDivisions,
  getDivision,
  createDivision,
  updateDivision,
  deleteDivision,
} = require("../controller/DivisionController");

router.route("/").get(getAllDivisions).post(createDivision);

router
  .route("/:id")
  .get(getDivision)
  .put(updateDivision)
  .delete(deleteDivision);

module.exports = router;
