const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Adding location
router.post("/add",locationController.addLocation);

// Getting all location
router.get("/get", locationController.getAllLocations);

module.exports = router;