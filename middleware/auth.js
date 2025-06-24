const Jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) return res.status(401).send("No token Found");

  const token = authHeader.split(" ")[1]; // Extract the token part

  if (!token) return res.status(401).send("No token Found");

  try {
    const decodedToken = Jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodedToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}

module.exports = authenticateUser;

// // Middleware to check authentication
// const verifyToken = (req, res, next) => {
//     const token = req.headers.token;
//     if (!token) {
//       return res.status(401).send('Access Denied');
//     }
//     jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//       if (err) {
//         return res.status(401).send('Access Denied');
//       }
//       req.user = decoded;
//       next();
//     });
// }
