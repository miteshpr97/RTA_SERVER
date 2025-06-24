const { sql } = require("../db");
const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const getSqlRequest = require("../utils/dbUtil");

// adding a new user
exports.addUser = async (req, res) => {
  try {
    const password = req.body.Password;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const request = getSqlRequest();
    // Input parameters
    request.input("UserID", sql.NVarChar, req.body.UserID);
    request.input("Username", sql.NVarChar, req.body.Username);
    request.input("Password", sql.NVarChar, hashedPassword);
    request.input("created_at", sql.DateTime, req.body.created_at);
    request.input("updated_at", sql.DateTime, req.body.updated_at);
    // SQL query to register new user
    const query = `
    INSERT INTO RTA_TB_User
    (UserID,Username,Password,created_at,updated_at)
    VALUES (@UserID,@Username,@Password,@created_at,@updated_at);
    `;
    await request.query(query);
    res.status(201).json({ Message: "New User added successfully" });
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// Getting all users
exports.getAllUser = async (req, res) => {
  try {
    const request = getSqlRequest();

    // SQL query to get all bus type
    const query = `
        SELECT UserID,Username,Password
        FROM RTA_TB_User;
        `;
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send({
      message: "No data found in the user table.",
      }); 
    }
  } catch (error) {
    console.error("SQL error : ", error);
    res.status(500).json({ Error: error.Message });
  }
};

// login a user
exports.loginUser = async (req, res) => {
  try {
    const request = getSqlRequest();

    // Input parameters
    request.input("Username", sql.NVarChar, req.body.Username);

    // SQL query to check user credentials
    const query = `
    SELECT UserID, Username, Password FROM RTA_TB_User
    WHERE Username = @Username;
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      // User not found
      return res.status(401).json({ error: "Invalid Username or password" });
    }

    const user = result.recordset[0];
    const storedHashedPassword = user.Password;

    const isPasswordValid = await bcrypt.compare(req.body.Password, storedHashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Username or password" });
    };

    const token = Jwt.sign({ id: user.UserID }, process.env.SECRET_KEY, { expiresIn: "1h" });

    res.status(200).header("Token", token).json({
      message: "Login successful",
      token: token,
      UserID: user.UserID,
      Username: user.Username,
    });
  } catch (err) {
    console.error("SQL error:", err);
    res.status(500).json({ error: err.message });
  }
};
