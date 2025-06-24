const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const { connectToDatabase } = require("./db");
const userRoute = require("./routes/userRoute");
const busTypeRoute = require("./routes/busTypeRoute");
const busRoute = require("./routes/busRoute");
const inspectionCategoryRoute = require("./routes/inspectionCategoryRoute");
const inspectionQuestionRoute = require("./routes/inspectionQuestionRoute");
const locationRoute = require("./routes/locationRoute");
const inspectionRoute = require("./routes/inspectionRoute");
const insCatAssociationRoute = require("./routes/inspectionCategoryAssocRoute");
const inspectionDetailsRoute = require("./routes/inspectionDetailsRoute");
const authenticateUser = require("./middleware/auth");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());

// Use Helmet middleware for basic security headers
app.use(helmet());

// XSS protection middleware
app.use(xssClean());

// API routes
app.use("/api/user", userRoute);
app.use("/api/busType", busTypeRoute);
app.use("/api/bus", busRoute);
app.use("/api/inspectionCategory", inspectionCategoryRoute);
app.use("/api/inspectionQuestion", inspectionQuestionRoute);
app.use("/api/location", locationRoute);
app.use("/api/inspection", inspectionRoute);
app.use("/api/association", insCatAssociationRoute);
app.use("/api/inspectionDetails", inspectionDetailsRoute);


// Connect to the database
connectToDatabase().catch((err) =>
  console.error("❌ Failed to connect to the database:", err.message)
);




module.exports = app;







// Connect to the database and start the server only if successful
// Start server after DB connection
// const startServer = async () => {
//   try {
//     await connectToDatabase();
//     const PORT = process.env.PORT || 1433;
//     app.listen(PORT, () => {
//       console.log(`✅ Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Failed to connect to the database:", err.message);
//     process.exit(1);
//   }
// };