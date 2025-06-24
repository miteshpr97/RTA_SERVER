const express = require("express");
const router = express.Router();
const inspectionController = require("../controllers/inspectionController");

// Adding inspection
router.post("/add",inspectionController.addInspection);

// Getting all inspection
router.get("/get", inspectionController.getAllInspections);

// Getting inspections whose inspectionStatus is 1
router.get("/completed", inspectionController.getAllInspectionsCompleted);

// Getting inspected bus count based on their type
router.get("/inspectedBuses", inspectionController.getInspectedBusCountsByType);

// Getting inspected bus count based on their type and userID
router.get("/inspectedBusCount", inspectionController.getInspectedBusCount);

// Getting inspectionStatus by inspectionID 
router.get("/:InspectionID", inspectionController.getAllInspectionsByID);

// Deleting inspection by inspection Id
router.delete("/delete/:InspectionID", inspectionController.deleteInspectionByID);


module.exports = router;