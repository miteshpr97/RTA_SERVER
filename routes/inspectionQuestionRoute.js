const express = require("express");
const router = express.Router();
const inspectionQuestionController = require("../controllers/inspectionQuestionController");

// Adding inspection question
router.post("/add",inspectionQuestionController.addQuestion);

// getting all inspection questions
router.get("/get",inspectionQuestionController.getQuestions);

module.exports = router;