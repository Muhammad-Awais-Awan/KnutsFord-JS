// routes/bookingRoutes.js
const express = require("express");
// Import the fs and path modules at the top of your file
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { poolPromise, sql } = require("../config/dataBaseConnection");

// Booking seats endpoint
router.post("/", async (req, res) => {
  const { seats, rdtID, parentRouteStopIds } = req.body;
  parentRouteStopIds.pop();
  try {
    const pool = await poolPromise;

    // Step 1: Validate input
    if (
      !seats ||
      !rdtID ||
      !parentRouteStopIds ||
      parentRouteStopIds.length === 0
    ) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Step 2: Check if enough seats are available for all the relevant stops
    const result = await pool
      .request()
      .input("rdtID", sql.Int, rdtID)
      .query(
        `SELECT MIN(AvailableSeats) AS MinAvailableSeats
         FROM DepartureSegments 
         WHERE RouteDepartureTimeID = @rdtID 
         AND ParentRouteStopsID IN (${parentRouteStopIds.join(", ")})`
      );

    const availableSeats = result.recordset[0].MinAvailableSeats;

    // Step 3: Ensure there are enough seats available
    if (availableSeats < seats) {
      return res.status(400).json({
        error: `Not enough seats available. Only ${availableSeats} seats are available.`,
      });
    }

    // Step 4: Deduct the booked seats from the available seats for all stops in the route
    await pool
      .request()
      .input("seats", sql.Int, seats)
      .input("rdtID", sql.Int, rdtID)
      .query(
        `UPDATE DepartureSegments 
         SET AvailableSeats = AvailableSeats - @seats 
         WHERE RouteDepartureTimeID = @rdtID 
         AND ParentRouteStopsID IN (${parentRouteStopIds.join(", ")})`
      );

    // Step 5: Log the booking details to a file
    // Fetch additional details for logging
    const routeInfoResult = await pool
      .request()
      .input("rdtID", sql.Int, rdtID)
      .query(
        `SELECT rdt.ActivationDate, rdt.ActiveTime, r.Code AS RouteCode
       FROM RouteDepartureTimes rdt
       JOIN Routes r ON r.Id = rdt.RouteID
       WHERE rdt.Id = @rdtID`
      );

    const routeInfo = routeInfoResult.recordset[0];

    // Get stop names
    const stopsResult = await pool.request().query(
      `SELECT prs.Id AS ParentRouteStopsID, b.Name AS BranchName
       FROM ParentRouteBranchStops prs
       JOIN Branches b ON b.Id = prs.BranchID
       WHERE prs.Id IN (${parentRouteStopIds.join(", ")})`
    );

    const stops = stopsResult.recordset.map((stop) => stop.BranchName);

    // Create a log entry
    const logEntry = {
      date: routeInfo.ActivationDate.toISOString().split("T")[0],
      time: routeInfo.ActiveTime,
      route: routeInfo.RouteCode,
      seatsBooked: seats,
      stops: stops,
      bookingTimestamp: new Date().toISOString(),
      rdtID,
    };

    // Define the log file path (e.g., logs/2022-08-07.log)
    const logDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    const logFilePath = path.join(logDir, `${logEntry.date}.log`);

    // Append the log entry to the file
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + "\n", (err) => {
      if (err) {
        console.error("Error writing booking log:", err);
        // Optionally handle the error (e.g., send a response or continue)
      }
    });

    // Step 5: Confirm the booking (you could also create a booking record here if necessary)
    res.json({
      success: true,
      message: `Successfully booked ${seats} seat(s)`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
