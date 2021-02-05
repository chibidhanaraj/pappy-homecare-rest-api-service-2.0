const express = require('express');
const { login, getCurrentUser } = require('./auth.controller');
const { protect } = require('../../middleware/authHandler');
const { validateAuth } = require('../../middleware/validators/AuthValidator');

const router = express.Router();

router.post('/login', login);
router.get('/currentUser', protect, getCurrentUser);

module.exports = router;
