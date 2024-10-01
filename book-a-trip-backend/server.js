// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

const { poolPromise } = require("./config/dataBaseConnection"); // Import database connection

app.use(cors());
app.use(bodyParser.json());

// Import routes
const branchRoutes = require("./routes/branchRoutes");
const routeRoutes = require("./routes/routeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Use routes
app.use("/api/branches", branchRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bookings", bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Test database connection
poolPromise
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));
