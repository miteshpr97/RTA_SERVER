const { sql } = require("../db");
const getSqlRequest = require("../utils/dbUtil");

// Adding location
exports.addLocation = async (req, res) => {
  try {
    const request = getSqlRequest();

    // inputParameters
    request.input("LocationID", sql.NVarChar, req.body.LocationID);
    request.input("LocationName", sql.NVarChar, req.body.LocationName);

    // SQL query to add new bus type
    const query = `
    INSERT INTO RTA_TB_Locations
    (LocationID, LocationName)
    VALUES (@LocationID, @LocationName);
`;

    await request.query(query);
    res.status(201).json({ Message: "New location added successfully" });
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting all location
exports.getAllLocations = async (req, res) => {
  try {
    const request = getSqlRequest();

    const query = `
    SELECT * 
    FROM RTA_TB_Locations;
`;

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
        message: "No location found in table.",
      });
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};