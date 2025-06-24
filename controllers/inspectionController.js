const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding inspection(Comment the code where user can not create another inspection if he has incompleted one)
exports.addInspection = async (req, res) => {
  try {
    const request = getSqlRequest();
    const { InspectionID, UserID, BusID, Odometer, FuelLevel, LocationID } = req.body;

    // Check if there's an existing incomplete inspection for the user
    // const existingInspectionQuery = `
    //     SELECT InspectionID 
    //     FROM RTA_TB_Inspections 
    //     WHERE UserID = @UserID AND InspectionStatus = 0;
    // `;
    
    // // Input parameter for checking existing inspection
    // request.input("UserID", sql.NVarChar, UserID);
    
    // const existingInspection = await request.query(existingInspectionQuery);

    // if (existingInspection.recordset.length > 0) {
    //   return res
    //     .status(400)
    //     .send({ error: "You cannot start a new inspection until the current one is completed." });
    // }

    // for now we r generating it from frontend

    // Fetch the latest InspectionID (reuse the same request object)
    // const result = await request.query(`
    //   SELECT TOP 1 InspectionID 
    //   FROM RTA_TB_Inspections 
    //   ORDER BY InspectionID DESC
    // `);

    // // Generate the new InspectionID
    // let newInspectionID = "INS001";
    // if (result.recordset.length > 0) {
    //   const latestID = result.recordset[0].InspectionID;
    //   const numericPart = parseInt(latestID.replace("INS", "")) + 1;
    //   newInspectionID = "INS" + numericPart.toString().padStart(3, "0");
    // }

    // Clear previous input parameters to avoid duplication
    // request.parameters = {};

    // Input Parameters for adding a new inspection
    request.input("InspectionID", sql.NVarChar, InspectionID);
    request.input("UserID", sql.NVarChar, UserID);
    request.input("BusID", sql.NVarChar, BusID);
    request.input("Odometer", sql.NVarChar, Odometer);
    request.input("FuelLevel", sql.NVarChar, FuelLevel);
    request.input("LocationID", sql.NVarChar, LocationID);
    request.input("InspectionStatus", sql.NVarChar, "0");

    // SQL query to add new inspection
    const query = `
    INSERT INTO RTA_TB_Inspections
    (InspectionID, UserID, BusID, Odometer, FuelLevel, LocationID, InspectionStatus, InspectionStartDate, InspectionEndDate)
    VALUES (@InspectionID, @UserID, @BusID, @Odometer, @FuelLevel, @LocationID, @InspectionStatus, GETDATE(), NULL);
    `;
    await request.query(query);

    res.status(201).json({
      Message: "New inspection added successfully",
      InspectionID: InspectionID,
    });
  } catch (error) {
    console.error("SQL error: ", error);
    res.status(500).json({ Error: error.message });
  }
};

// Getting all inspection
exports.getAllInspections = async (req, res) => {
  try {
    const request = getSqlRequest();

    const query = `
    SELECT * 
    FROM RTA_TB_Inspections;
`;

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "Can't found any inspection in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting inspections whose inspectionStatus is 1
exports.getAllInspectionsCompleted = async (req, res) => {
  try {
    const request = getSqlRequest();

    const query = `
    SELECT * 
    FROM RTA_TB_Inspections
    WHERE InspectionStatus = 1;
`;

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "Can't found any inspection in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting InspectionStatus by inspectionID 
exports.getAllInspectionsByID = async (req, res) => {
  try {
    const request = getSqlRequest();
    const inspectionId = req.params.InspectionID;

    const query = `
     
      SELECT InspectionID, InspectionStatus
      FROM RTA_TB_Inspections
      WHERE InspectionID = @InspectionID
      AND InspectionStatus = 1;
    `;

    // Add parameter to the query
    request.input('InspectionID', inspectionId);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).json({
        message: "Can't find any inspection in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error: ", error);
    res.status(500).json({ Error: error.message });
  }
};

// Getting inspected bus count based on their type
exports.getInspectedBusCountsByType = async (req, res) => {
  try {
    const request = getSqlRequest();

    // SQL query to get the total number of inspected buses and inspected buses by type
    const query = `
      SELECT 
        BT.BusType,
        COUNT(CASE WHEN I.InspectionStatus = 1 THEN 1 END) AS InspectedCount
      FROM RTA_TB_Buses B
      INNER JOIN RTA_TB_BusType BT ON B.BusTypeID = BT.BusTypeID
      LEFT JOIN RTA_TB_Inspections I ON B.BusID = I.BusID
      GROUP BY BT.BusType;
    `;

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      const totalInspected = result.recordset.reduce((acc, row) => acc + row.InspectedCount, 0);
      const response = {
        TotalInspected: totalInspected,
        BusTypes: result.recordset
      };
      res.status(200).json(response);
    } else {
      res.status(404).send({
        message: "No data found for inspected bus counts.",
      });
    }
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ Error: error.message });
  }
};

// Getting inspected bus count based on their type and userID
exports.getInspectedBusCount = async (req, res) => {
  try {
    const request = getSqlRequest();
    const UserID = req.query.UserID;

    let WhereClause = '';  // Initialize as an empty string

    if (UserID) {
      WhereClause = "WHERE I.UserID = @UserID";  // Add WHERE clause
      request.input("UserID", sql.VarChar, UserID);
    }

    // SQL query to get the number of inspected buses by type
    const query = `
      SELECT 
        BT.BusType,
        COUNT(CASE WHEN I.InspectionStatus = 1 THEN 1 END) AS InspectedCount
      FROM RTA_TB_Buses B
      INNER JOIN RTA_TB_BusType BT ON B.BusTypeID = BT.BusTypeID
      LEFT JOIN RTA_TB_Inspections I ON B.BusID = I.BusID
      ${WhereClause} 
      GROUP BY BT.BusType;
    `;
    
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Remove the total inspected count from the response
      const response = result.recordset;
      res.status(200).json(response);
    } else {
      res.status(404).send({
        message: "No data found for inspected bus counts.",
      });
    }
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ Error: error.message });
  }
};

// Deleting inspection by inspection Id
exports.deleteInspectionByID = async (req, res) => {
  try {
    const request = getSqlRequest();
    const InspectionID = req.params.InspectionID;
    console.log("hi");
    

    const query = `
    DELETE FROM RTA_TB_Inspections
    WHERE InspectionID = @InspectionID;
`;
    request.input("InspectionID", sql.NVarChar, InspectionID);
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "Can't found any inspection in the table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};
