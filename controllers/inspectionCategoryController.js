const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding inspection categories
exports.addCategory = async (req, res) => {
  try {
    const request = getSqlRequest();

    // inputParameters
    request.input("CategoryID", sql.NVarChar, req.body.CategoryID);
    request.input("CategoryName", sql.NVarChar, req.body.CategoryName);
    
    // SQL query to add new category
    const query = `
    INSERT INTO RTA_TB_InspectionCategories
    (CategoryID,CategoryName)
    VALUES (@CategoryID,@CategoryName);
    `;
    await request.query(query);
    res.status(201).json({ Message: "New Category added successfully" });
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting all categories
exports.getCategories = async (req, res) => {
  try {
    const request = getSqlRequest();

    // SQL query to get all categories
    const query = `
        SELECT *
        FROM RTA_TB_InspectionCategories
        ORDER BY CategoryID;
        `;
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
      message: "No data found in the category table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};
