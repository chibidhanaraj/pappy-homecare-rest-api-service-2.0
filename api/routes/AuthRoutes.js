const express = require("express");
const { login, getCurrentUser } = require("../controller/AuthController");
const { protect } = require("../../middleware/authHandler");
const { validateAuth } = require("../../middleware/validators/AuthValidator");

const router = express.Router();

router.post("/login", validateAuth, login);
router.get("/currentUser", protect, getCurrentUser);

module.exports = router;
