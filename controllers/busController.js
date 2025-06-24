const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding bus details
exports.addBus = async (req, res) => {
  try {
    const request = getSqlRequest();

    // inputParameters
    request.input("BusID", sql.NVarChar, req.body.BusID);
    request.input("BusNumber", sql.NVarChar, req.body.BusNumber);
    request.input("BusTypeID", sql.NVarChar, req.body.BusTypeID);
    request.input("Status", sql.NVarChar, req.body.Status);
    request.input(
      "LastInspectionDate",
      sql.DateTime,
      req.body.LastInspectionDate
    );

    // SQL query to add new bus type
    const query = `
    INSERT INTO RTA_TB_Buses
    (BusID, BusNumber, BusTypeID, Status, LastInspectionDate)
    VALUES (@BusID, @BusNumber, @BusTypeID, @Status, @LastInspectionDate);
`;

    await request.query(query);
    res.status(201).json({ Message: "New bus details added successfully" });
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting all bus type
exports.getAllBusDetails = async (req, res) => {
  try {
    const request = getSqlRequest();

    const query = `
      SELECT 
          BusTypeID,
          JSON_QUERY(
              (SELECT BusID, BusNumber
               FROM RTA_TB_Buses AS b
               WHERE b.BusTypeID = a.BusTypeID AND Status = 'A'
               FOR JSON PATH)
          ) AS BusDetails
      FROM RTA_TB_Buses AS a
      WHERE Status = 'A'
      GROUP BY BusTypeID;
    `;

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Parse BusDetails JSON string for each record
      const parsedData = result.recordset.map(item => ({
        BusTypeID: item.BusTypeID,
        BusDetails: JSON.parse(item.BusDetails) 
      }));

      // Send the response with parsed data
      res.status(200).json(parsedData);
    } else {
      res.status(404).json({ message: "No data found in the bus table." });
    }
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Getting bus details of particular type
exports.getBusDetailsOfParticularType = async (req, res) => {
  try {
    const request = getSqlRequest();
    const BusTypeID = req.params.BusTypeID;

    // SQL query to get bus details of a particular type
    const query = `
      SELECT BusTypeID, 
             JSON_QUERY(
                 (SELECT BusID, BusNumber
                  FROM RTA_TB_Buses
                  WHERE BusTypeID = @BusTypeID AND Status = 'A'
                  FOR JSON PATH
                 )
             ) AS BusDetails
      FROM RTA_TB_Buses
      WHERE Status = 'A' AND BusTypeID = @BusTypeID
      GROUP BY BusTypeID;
    `;

    request.input("BusTypeID", sql.NVarChar, BusTypeID);
    const result = await request.query(query);

    if (result.recordset.length > 0) {
      // Parse BusDetails JSON string for each record
      const parsedData = result.recordset.map(item => ({
        BusTypeID: item.BusTypeID,
        BusDetails: JSON.parse(item.BusDetails)
      }));

      res.status(200).json(parsedData);
    } else {
      res.status(404).json({ 
        message: "No data found for the specified bus type." 
      });
    }
  } catch (error) {
    console.error("SQL error:", error);
    res.status(500).json({ error: error.message });
  }
};

