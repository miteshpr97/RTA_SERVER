const express = require("express");
const router = express.Router();
const inspectionCategoryController = require("../controllers/inspectionCategoryController");

// Adding inspection categories
router.post("/add",inspectionCategoryController.addCategory);

// getting all inspection categories
router.get("/get",inspectionCategoryController.getCategories);

module.exports = router;