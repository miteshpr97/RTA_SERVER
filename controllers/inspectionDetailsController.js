const { sql, getPool } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding inspection details(Important logic)
// exports.addInspectionDetails = async (req, res) => {
//   const { InspectionID, CategoryID } = req.params;
//   const Responses = req.body;

//   if (!Array.isArray(Responses) || Responses.length === 0) {
//     return res.status(400).send({ error: "Responses array is required and should not be empty." });
//   }

//   const pool = getPool();
//   const transaction = new sql.Transaction(pool);

//   try {
//     await transaction.begin();

//     const request = new sql.Request(transaction);

//     const validResponses = Responses.every(R => R.Response === 'yes' || R.Response === 'no' || R.Response === 'YES' || R.Response === 'NO');
//     if (!validResponses) {
//       throw new Error("All questions must be answered with 'yes' or 'no'.");
//     }

//     const insertResponseQuery = `
//       INSERT INTO RTA_TB_InspectionDetails (InspectionID, QuestionID, Response)
//       VALUES (@InspectionID, @QuestionID, @Response);
//     `;

//     for (let i = 0; i < Responses.length; i++) {
//       const { QuestionID, Response } = Responses[i];

//       // Prepare parameters for the current response
//       request.input("InspectionID", sql.NVarChar, InspectionID);
//       request.input("QuestionID", sql.NVarChar, QuestionID);
//       request.input("Response", sql.NVarChar, Response);

//       // Execute the query
//       await request.query(insertResponseQuery);

//       // Clear parameters for the next iteration
//       request.parameters = {};
//     }

//     // Update the CategoryStatus for this category to 1
//     const updateCategoryStatusQuery = `
//       UPDATE RTA_TB_InspectionCategories_Association
//       SET CategoryStatus = 1
//       WHERE InspectionID = @InspectionID AND CategoryID = @CategoryID;
//     `;
//     request.input('InspectionID', sql.NVarChar, InspectionID);
//     request.input('CategoryID', sql.NVarChar, CategoryID);
//     await request.query(updateCategoryStatusQuery);

//     // Clear parameters after updating CategoryStatus
//     request.parameters = {};

//     // Check if two associations with the given InspectionID have CategoryStatus = 1
//     const checkAssociationsQuery = `
//       SELECT COUNT(*) as CompletedCategories
//       FROM RTA_TB_InspectionCategories_Association
//       WHERE InspectionID = @InspectionID AND CategoryStatus = 1;
//     `;
//     request.input('InspectionID', sql.NVarChar, InspectionID);
//     const result = await request.query(checkAssociationsQuery);

//     // Clear parameters after checking the number of completed categories
//     request.parameters = {};

//     // Update InspectionStatus and LastInspectionDate only if there are exactly two completed categories
//     if (result.recordset[0].CompletedCategories === 2) {
//       const updateInspectionStatusQuery = `
//         UPDATE RTA_TB_Inspections
//         SET InspectionStatus = 1,
//             InspectionEndDate = GETDATE()
//         WHERE InspectionID = @InspectionID;
//       `;
//       request.input('InspectionID', sql.NVarChar, InspectionID);
//       await request.query(updateInspectionStatusQuery);

//       // Clear parameters before updating the buses table
//       request.parameters = {};

//       // Update LastInspectionDate in the Buses table
//       const updateLastInspectionDateQuery = `
//         UPDATE RTA_TB_Buses
//         SET LastInspectionDate = GETDATE()
//         WHERE BusID = (
//           SELECT BusID FROM RTA_TB_Inspections WHERE InspectionID = @InspectionID
//         );
//       `;
//       request.input('InspectionID', sql.NVarChar, InspectionID);
//       await request.query(updateLastInspectionDateQuery);
//     }

//     await transaction.commit();

//     res.status(200).send({ message: "Category inspection completed successfully, moving to the next category." });
//   } catch (error) {
//     console.error("Error completing category inspection:", error);
//     try {
//       await transaction.rollback();
//     } catch (rollbackError) {
//       console.error("Error rolling back transaction:", rollbackError);
//     }
//     res.status(500).send({ error: "An error occurred while completing the category inspection." });
//   }
// };

exports.addInspectionDetails = async (req, res) => {
  const { InspectionID, CategoryID } = req.params;
  const Responses = req.body;

  if (!Array.isArray(Responses) || Responses.length === 0) {
    return res
      .status(400)
      .send({ error: "Responses array is required and should not be empty." });
  }

  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = new sql.Request(transaction);

    const validResponses = Responses.every(
      (R) =>
        R.Response === "yes" ||
        R.Response === "no" ||
        R.Response === "YES" ||
        R.Response === "NO"
    );
    if (!validResponses) {
      throw new Error("All questions must be answered with 'yes' or 'no'.");
    }

    const insertResponseQuery = `
      INSERT INTO RTA_TB_InspectionDetails (InspectionID, QuestionID, Response)
      VALUES (@InspectionID, @QuestionID, @Response);
    `;

    for (let i = 0; i < Responses.length; i++) {
      const { QuestionID, Response } = Responses[i];

      request.input("InspectionID", sql.NVarChar, InspectionID);
      request.input("QuestionID", sql.NVarChar, QuestionID);
      request.input("Response", sql.NVarChar, Response);

      await request.query(insertResponseQuery);
      request.parameters = {};
    }

    const updateCategoryStatusQuery = `
      UPDATE RTA_TB_InspectionCategories_Association
      SET CategoryStatus = 1
      WHERE InspectionID = @InspectionID AND CategoryID = @CategoryID;
    `;
    request.input("InspectionID", sql.NVarChar, InspectionID);
    request.input("CategoryID", sql.NVarChar, CategoryID);
    await request.query(updateCategoryStatusQuery);
    request.parameters = {};

    // Check if both IC001 and IC003 have CategoryStatus = 1
    const checkAssociationsQuery = `
      SELECT 
        SUM(CASE WHEN CategoryID = 'IC001' AND CategoryStatus = 1 THEN 1 ELSE 0 END)as IC001Completed,
        SUM(CASE WHEN CategoryID = 'IC003' AND CategoryStatus = 1 THEN 1 ELSE 0 END)      as IC003Completed
      FROM RTA_TB_InspectionCategories_Association
      WHERE InspectionID = @InspectionID;
      `;
    request.input("InspectionID", sql.NVarChar, InspectionID);
    const result = await request.query(checkAssociationsQuery);

    // Clear parameters after checking the completed categories
    request.parameters = {};

    // Update InspectionStatus and LastInspectionDate only if both IC001 and IC003 categories are completed
    if (
      result.recordset[0].IC001Completed >= 1 &&
      result.recordset[0].IC003Completed >= 1
    ) {
      const updateInspectionStatusQuery = `
        UPDATE RTA_TB_Inspections
        SET InspectionStatus = 1,
            InspectionEndDate = GETDATE()
        WHERE InspectionID = @InspectionID;
      `;
      request.input("InspectionID", sql.NVarChar, InspectionID);
      await request.query(updateInspectionStatusQuery);

      // Clear parameters before updating the buses table
      request.parameters = {};

      // Update LastInspectionDate in the Buses table
      const updateLastInspectionDateQuery = `
        UPDATE RTA_TB_Buses
        SET LastInspectionDate = GETDATE()
        WHERE BusID = (
          SELECT BusID FROM RTA_TB_Inspections WHERE InspectionID = @InspectionID
        );
      `;
      request.input("InspectionID", sql.NVarChar, InspectionID);
      await request.query(updateLastInspectionDateQuery);
    }

    await transaction.commit();

    res
      .status(200)
      .send({
        message:
          "Category inspection completed successfully, moving to the next category.",
      });
  } catch (error) {
    console.error("Error completing category inspection:", error);
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Error rolling back transaction:", rollbackError);
    }
    res
      .status(500)
      .send({
        error: "An error occurred while completing the category inspection.",
      });
  }
};

// Getting all inspection details
exports.getAllInspectionDetails = async (req, res) => {
  try {
    const request = getSqlRequest();

    const query = `
      SELECT * 
      FROM RTA_TB_InspectionDetails;
  `;

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "Can't found any inspection details in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting inspection details with all information
exports.getInspectionResponseDetails = async (req, res) => {
  const { InspectionID } = req.params;

  try {
    const request = getSqlRequest();

    request.input("InspectionID", sql.NVarChar, InspectionID);

    const query = `
      SELECT 
          u.UserID,
          u.UserName,
          b.BusID,
          b.BusNumber,
          bt.BusTypeID,
          bt.BusType,
          c.CategoryID,
          c.CategoryName,
          q.QuestionID,
          q.Question,
          id.Response
      FROM 
          RTA_TB_InspectionDetails id
      JOIN 
          RTA_TB_Inspections i ON id.InspectionID = i.InspectionID
      JOIN 
          RTA_TB_User u ON i.UserID = u.UserID
      JOIN 
          RTA_TB_Buses b ON i.BusID = b.BusID
      JOIN 
          RTA_TB_BusType bt ON b.BusTypeID = bt.BusTypeID
      JOIN 
          RTA_TB_InspectionCategories_Association ica ON i.InspectionID = ica.InspectionID
      JOIN 
          RTA_TB_InspectionCategories c ON ica.CategoryID = c.CategoryID
      JOIN 
          RTA_TB_InspectionQuestions q ON id.QuestionID = q.QuestionID
      WHERE 
          i.InspectionID = @InspectionID;
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({
          message: "No inspection details found for the provided InspectionID.",
        });
    }

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching inspection details: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching inspection details." });
  }
};

// Getting bus inspection status count(Ok status or Error status) based on date too

exports.getBusInspectionStatusCounts = async (req, res) => {
  try {
    const request = getSqlRequest();

    const { InspectionStartDate } = req.query;

    let whereClause = "";

    // Add date filter if InspectionStartDate is provided
    if (InspectionStartDate) {
      whereClause = `
        WHERE CAST(I.InspectionStartDate AS DATE) = CAST(@InspectionStartDate AS DATE)
      `;
      request.input(
        "InspectionStartDate",
        sql.DateTime,
        new Date(InspectionStartDate)
      );
    }

    // SQL query to get the total number of inspected buses and inspected buses by type with date filtering
    const query = `
      SELECT 
          BT.BusType,
          SUM(CASE WHEN UPPER(ID.response) = 'YES' THEN 1 ELSE 0 END) AS OkStatusCount,
          SUM(CASE WHEN UPPER(ID.response) = 'NO' THEN 1 ELSE 0 END) AS ErrorStatusCount
      FROM 
          RTA_TB_Buses B
      INNER JOIN 
          RTA_TB_BusType BT ON B.BusTypeID = BT.BusTypeID
      LEFT JOIN 
          RTA_TB_Inspections I ON B.BusID = I.BusID
      LEFT JOIN 
          RTA_TB_InspectionDetails ID ON I.InspectionID = ID.InspectionID
      ${whereClause} 
      GROUP BY 
          BT.BusType;
    `;

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "No data found for bus inspection status counts.",
      });
    }
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ Error: error.message });
  }
};
