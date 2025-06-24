const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");
const authenticateUser = require("../middleware/auth");

// Adding bus details
router.post("/add",busController.addBus);

// Getting all bus details
router.get("/get", busController.getAllBusDetails);
// router.get("/get", authenticateUser , busController.getAllBusDetails);

// Getting bus details of particular type
router.get("/get/:BusTypeID", busController.getBusDetailsOfParticularType);

module.exports = router;