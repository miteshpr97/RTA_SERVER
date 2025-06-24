const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding association(Comment the code where user can not create another association if he has incompleted one)
exports.addAssociation = async (req, res) => {
  try {
    const request = getSqlRequest();
    const { InspectionID, CategoryID } = req.body;

    // Check if there's an existing incomplete category for the inspection
    // const existingCategoryQuery = `
    //     SELECT CategoryID 
    //     FROM RTA_TB_InspectionCategories_Association 
    //     WHERE InspectionID = @InspectionID AND CategoryStatus = 0;
    // `;
    // const existingCategory = await request
    //   .input("InspectionID", sql.NVarChar, InspectionID)
    //   .query(existingCategoryQuery);

    // if (existingCategory.recordset.length > 0) {
    //   return res
    //     .status(400)
    //     .send({
    //       error:
    //         "You cannot associate a new category until the current one is completed.",
    //     });
    // }

    // Proceed with associating the new category (if no incomplete category exists)
    request.input("InspectionID", sql.NVarChar, InspectionID);
    request.input("CategoryID", sql.NVarChar, CategoryID);
    request.input("CategoryStatus", sql.NVarChar, "0");

    // SQL query to add new association
    const query = `
        INSERT INTO RTA_TB_InspectionCategories_Association
        (InspectionID, CategoryID, CategoryStatus)
        VALUES (@InspectionID, @CategoryID, @CategoryStatus);
    `;

    await request.query(query);

    res.status(201).json({ Message: "New association added successfully" });
  } catch (error) {
    console.error("SQL error: ", error);
    res.status(500).json({ Error: error.message });
  }
};

// Getting all association
exports.getAllAssociations = async (req, res) => {
  try {
    const request = getSqlRequest();

    const query = `
    SELECT * 
    FROM RTA_TB_InspectionCategories_Association;
`;

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "Can't found any association in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// check Status by ID
exports.checkStatus = async (req, res) => {
  try {
    const request = getSqlRequest();
    const { InspectionID } = req.body;  

    const query = `
    SELECT * 
      FROM RTA_TB_InspectionCategories_Association 
      WHERE InspectionID = @InspectionID
    `;

    request.input('InspectionID', InspectionID);  

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "Can't find any association in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.message });  
  }
};


