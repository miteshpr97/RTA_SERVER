const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateUser = require("../middleware/auth");

// Adding a user
router.post("/addUser", authenticateUser , userController.addUser);

// getting a user
router.get("/getUsers", userController.getAllUser);

// login a user
router.post("/login",userController.loginUser);

module.exports = router;