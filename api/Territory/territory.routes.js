const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAllTerritories } = require('./territory.controller');

router.route('/').get(getAllTerritories);

module.exports = router;
