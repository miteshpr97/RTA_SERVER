const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding bus type
exports.addBusType = async (req, res) => {
  try {
    const request = getSqlRequest();

    // inputParameters
    request.input("BusTypeID", sql.NVarChar, req.body.BusTypeID);
    request.input("BusType", sql.NVarChar, req.body.BusType);
    request.input("created_at", sql.DateTime , req.body.created_at);
    request.input("updated_at", sql.DateTime , req.body.updated_at);

    // SQL query to add new bus type
    const query = `
    INSERT INTO RTA_TB_BusType
    (BusTypeID,BusType,created_at,updated_at)
    VALUES (@BusTypeID,@BusType,@created_at,@updated_at);
    `;
    await request.query(query); 
    res.status(201).json({ Message: "New bus type added successfully" });
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting all bus type
exports.getAllBusType = async (req, res) => {
  try {
    const request = getSqlRequest();

    // SQL query to get all bus type
    const query = `
        SELECT BusTypeID,BusType
        FROM RTA_TB_BusType
        ORDER BY BusTypeID;
        `;
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
      message: "No data found in the bus type table.",
      }); 
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Get bus type by id
exports.getBusTypeByID = async (req, res) => {
  try {
    const request = getSqlRequest();
    const BusTypeID = req.params.BusTypeID;

    // SQL query to get all bus type
    const query = `
        SELECT BusType
        FROM RTA_TB_BusType
        WHERE BusTypeID = @BusTypeID;
        `;
    request.input("BusTypeID",sql.NVarChar,BusTypeID)
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
      message: "No data found in the bus type table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting bus count on the basis of their type
exports.getBusCountsByType = async (req, res) => {
  try {
    const request = getSqlRequest();

    // SQL query to count buses by type
    const query = `
      SELECT BT.BusType, COUNT(B.BusID) AS count
      FROM RTA_TB_Buses B
      INNER JOIN RTA_TB_BusType BT ON B.BusTypeID = BT.BusTypeID
      GROUP BY BT.BusTypeID, BT.BusType;
    `;

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "No data found for bus counts.",
      });
    }
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ Error: error.message });
  }
};
