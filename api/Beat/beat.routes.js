const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllBeats,
  createBeat,
  updateBeat,
  deleteBeat,
} = require('./beat.controller');

router.route('/').get(getAllBeats).post(protect, createBeat);

router.route('/:id').patch(protect, updateBeat).delete(deleteBeat);

module.exports = router;
