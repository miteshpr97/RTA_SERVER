const express = require("express");
const router = express.Router();
const inspectionDetailsController = require("../controllers/inspectionDetailsController");

// Adding inspection details or responses
router.post("/add/:InspectionID/:CategoryID", inspectionDetailsController.addInspectionDetails);

// Getting all inspection details or responses
router.get("/get", inspectionDetailsController.getAllInspectionDetails);

// Getting inspection details with all information
router.get("/getResponseDetails/:InspectionID", inspectionDetailsController.getInspectionResponseDetails);

// Getting bus inspection status count(Ok status or Error status)
router.get("/getInspectionStatusCount", inspectionDetailsController.getBusInspectionStatusCounts);

module.exports = router;
