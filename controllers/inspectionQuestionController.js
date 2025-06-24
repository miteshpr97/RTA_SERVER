const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding inspection question
exports.addQuestion = async (req, res) => {
  try {
    const request = getSqlRequest();

    // inputParameters
    request.input("QuestionID", sql.NVarChar, req.body.QuestionID);
    request.input("CategoryID", sql.NVarChar, req.body.CategoryID);
    request.input("Question", sql.NVarChar, req.body.Question);
    
    // SQL query to add new Question
    const query = `
    INSERT INTO RTA_TB_InspectionQuestions
    (QuestionID, CategoryID, Question)
    VALUES (@QuestionID, @CategoryID, @Question);
    `;
    await request.query(query);
    res.status(201).json({ Message: "New Question added successfully" });
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting inspection questions by categoryID
exports.getQuestions = async (req, res) => {
  try {
    const request = getSqlRequest();

    // SQL query to get questions with their CategoryID
    const query = `
      SELECT CategoryID, QuestionID, Question
      FROM RTA_TB_InspectionQuestions;
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "There isn't any question in the given category.",
      });
    }

    // Transforming flat list to grouped format
    const grouped = {};

    result.recordset.forEach((row) => {
      const { CategoryID, QuestionID, Question } = row;
      if (!grouped[CategoryID]) {
        grouped[CategoryID] = [];
      }

      grouped[CategoryID].push({
        questionID: QuestionID,
        question: Question,
      });
    });

    // Convert grouped object to an array if needed, else keep as object
    const response = Object.keys(grouped).map((categoryID) => ({
      categoryID,
      questions: grouped[categoryID],
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ Error: error.message });
  }
};

