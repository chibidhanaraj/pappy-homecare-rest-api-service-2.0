const express = require("express");
const router = express.Router();
const {
  getAllBeatAreas,
  getBeatArea,
  createBeatArea,
  updateBeatArea,
  deleteBeatArea,
} = require("../controller/BeatAreaController");

router.route("/").get(getAllBeatAreas).post(createBeatArea);

router
  .route("/:id")
  .get(getBeatArea)
  .patch(updateBeatArea)
  .delete(deleteBeatArea);

module.exports = router;
