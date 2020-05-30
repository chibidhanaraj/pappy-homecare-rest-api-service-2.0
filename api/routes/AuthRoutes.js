const express = require("express");
const { login, getCurrentUser } = require("../controller/AuthController");
const { protect } = require("../../middleware/authHandler");

const router = express.Router();

router.post("/login", login);
router.get("/currentUser", protect, getCurrentUser);

module.exports = router;
