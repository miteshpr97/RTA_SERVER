const express = require("express");
const router = express.Router();
const inspectionCategoryAssocController = require("../controllers/inspectionCategoryAssocController");

// Adding association
router.post("/add",inspectionCategoryAssocController.addAssociation);

// Getting all association
router.get("/get", inspectionCategoryAssocController.getAllAssociations);

// check category status
router.post("/checkStatus", inspectionCategoryAssocController.checkStatus);

module.exports = router;