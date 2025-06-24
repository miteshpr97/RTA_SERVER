const express = require("express");
const router = express.Router();
const busTypeController = require("../controllers/busTypeController");
const authenticateUser = require("../middleware/auth");

// Adding bus type
router.post("/add",busTypeController.addBusType);

// Getting all bus type
router.get("/get",busTypeController.getAllBusType);
// router.get("/get", authenticateUser , busTypeController.getAllBusType);

// Get bus type by id
router.get("/get/:BusTypeID",busTypeController.getBusTypeByID);

// Getting bus count on the basis of their type
router.get("/busCount",busTypeController.getBusCountsByType);

module.exports = router;