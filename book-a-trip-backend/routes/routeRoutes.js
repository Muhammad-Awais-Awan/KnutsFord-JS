// routes/routeRoutes.js
const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../config/dataBaseConnection");
// const { getRoutesTable, getParentRouteBranchStops } = require("./routeFinder"); // Import your route functions
const RouteFinder = require("./routeFinder"); // Assuming you have the RouteFinder class in a separate file

// Get routes based on origin and destination
router.get("/", async (req, res) => {
  const { originId, destinationId } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("originId", sql.Int, originId)
      .input("destinationId", sql.Int, destinationId)
      .query(
        "SELECT * FROM Routes WHERE OriginBranchId = @originId AND DestinationBranchId = @destinationId"
      ); // Adjust table name as necessary
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get available times and seats for a selected route on a specific date
router.get("/available-times", async (req, res) => {
  const { routeId, date } = req.query;

  try {
    const pool = await poolPromise;

    // Step 1: Check if it's a parent route or sub-route and get the appropriate stop IDs
    const stopsResult = await getRelevantStops(pool, routeId); // Use the helper function for both parent and sub-routes
    const stopIds = stopsResult.recordset.map((row) => row.Id); // Extract the ParentRouteBranchStops Ids
    console.log("STOPS : ", stopIds, "DATE : ", date, "ROUTE ID : ", routeId);
    if (stopIds.length === 0) {
      return res
        .status(404)
        .json({ error: "No stops found for the selected route." });
    }

    // Step 2: Get the parent route's RouteDepartureTimeID for the same date (in case of sub-route)
    const routeInfo = await pool
      .request()
      .input("routeID", sql.Int, routeId)
      .query(`SELECT ParentRoute FROM Routes WHERE Id = @routeID`);

    const routeData = routeInfo.recordset[0];

    // If it's a sub-route, we need to find the parent route's RouteDepartureTimeID
    let parentRouteId =
      routeData.ParentRoute === 0 ? routeId : routeData.ParentRoute;

    if (parentRouteId === 0) {
      const result = await pool
        .request()
        .input("date", sql.Date, date)
        .input("parentRouteID", sql.Int, parentRouteId) // Use the parentRouteID in case of sub-routes
        .query(`
            SELECT 
                rdt.Id AS RouteDepartureTimeID, 
                rdt.ActiveTime, 
                MIN(ds.AvailableSeats) AS MinAvailableSeats,
                ds.RouteDepartureTimeID AS rdtID
            FROM 
                RouteDepartureTimes rdt
            JOIN 
                DepartureSegments ds ON ds.RouteDepartureTimeID = rdt.Id
            WHERE 
                rdt.RouteID = @parentRouteID 
                AND CONVERT(DATE, rdt.ActivationDate) = @date
                AND ds.ParentRouteStopsID IN (${stopIds.join(
                  ", "
                )})  -- Use the Ids from ParentRouteBranchStops
            GROUP BY 
                rdt.Id, rdt.ActiveTime
        `);
      const availableTimesWithSeats = [];
      for (const RouteSlot of result) {
        availableTimesWithSeats.push({
          time: RouteSlot.ActiveTime,
          slotId: RouteSlot.Slot,
          availableSeats: RouteSlot.MinAvailableSeats,
          rdtID: RouteSlot.rdtID,
          parentRouteStopIds: stopIds,
        });
      }
      // Step 4: Return the available times and seats
      res.json(result.recordset);
    }

    // Step 3: Get the ActiveTime and Slot of the sub-route
    const subRouteRDTResult = await pool
      .request()
      .input("routeID", sql.Int, routeId)
      .input("date", sql.Date, date).query(`
        SELECT ActiveTime, Slot 
        FROM RouteDepartureTimes 
        WHERE RouteId = @routeID 
        AND CONVERT(DATE, ActivationDate) = @date 
        AND Slot NOT IN (-1, 0)
      `);

    const subRouteRDT = subRouteRDTResult.recordset;

    if (subRouteRDT.length === 0) {
      return res
        .status(404)
        .json({ error: "No active times for the selected sub-route." });
    }

    // Step 4: Get the slots from the parent route on the same date
    const parentRouteSlotsResult = await pool
      .request()
      .input("parentRouteID", sql.Int, parentRouteId)
      .input("date", sql.Date, date).query(`
        SELECT 
          rdt.Id AS RouteDepartureTimeID, 
          rdt.ActiveTime, 
          rdt.Slot 
        FROM RouteDepartureTimes rdt
        WHERE rdt.RouteID = @parentRouteID 
        AND CONVERT(DATE, rdt.ActivationDate) = @date
      `);

    const parentRouteSlots = parentRouteSlotsResult.recordset;

    if (parentRouteSlots.length === 0) {
      return res.status(404).json({
        error: "No slots found for the parent route on the selected date.",
      });
    }

    // Step 5: Match the slots between parent route and sub-route, then get the available seats
    const availableTimesWithSeats = [];

    for (const subRouteSlot of subRouteRDT) {
      // Find matching slot in the parent route
      const matchingParentSlot = parentRouteSlots.find(
        (parentSlot) => parentSlot.Slot === subRouteSlot.Slot
      );

      if (matchingParentSlot) {
        const seatsResult = await pool
          .request()
          .input(
            "routeDepartureTimeID",
            sql.Int,
            matchingParentSlot.RouteDepartureTimeID
          ).query(`
            SELECT MIN(ds.AvailableSeats) AS MinAvailableSeats
            FROM DepartureSegments ds
            WHERE ds.RouteDepartureTimeID = @routeDepartureTimeID
            AND ds.ParentRouteStopsID IN (${stopIds.join(", ")})
          `);

        const minAvailableSeats = seatsResult.recordset[0].MinAvailableSeats;
        const rdtID = seatsResult.recordset[0].rdtID;

        availableTimesWithSeats.push({
          time: subRouteSlot.ActiveTime,
          slotId: subRouteSlot.Slot,
          availableSeats: minAvailableSeats,
          rdtID: matchingParentSlot.RouteDepartureTimeID,
          parentRouteStopIds: stopIds,
        });
      }
    }

    // Step 6: Return the available times and seats
    res.json(availableTimesWithSeats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Endpoint to find the optimal route
router.get("/find-route", async (req, res) => {
  const { originBranchID, destinationBranchID } = req.query;

  if (!originBranchID || !destinationBranchID) {
    return res.status(400).json({
      error: "Please provide both originBranchID and destinationBranchID",
    });
  }

  try {
    const pool = await poolPromise;
    // Fetch route and stop information from the database
    const routesTable = await getRoutesTable(pool);
    const parentRouteBranchStops = await getParentRouteBranchStops(pool);

    // Initialize the RouteFinder class
    const routeFinder = new RouteFinder(routesTable, parentRouteBranchStops);

    // Find the optimal route
    const result = await routeFinder.findRoute(
      parseInt(originBranchID),
      parseInt(destinationBranchID)
    );

    // Respond with the results
    return res.status(200).json({
      shortestPath: result.shortestPath,
      allRoutes: result.allRoutes,
      travelSegments: result.travelSegments,
    });
  } catch (error) {
    console.error("Error finding route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
// Helper function to get stops (handles both parent and sub-routes)
async function getRelevantStops(pool, routeId) {
  // Check if the route is a parent or a sub-route
  const routeInfo = await pool
    .request()
    .input("routeID", sql.Int, routeId)
    .query(
      `SELECT ParentRoute, OriginBranchID, DestinationBranchID, Id FROM Routes WHERE Id = @routeID`
    );

  const routeData = routeInfo.recordset[0];

  // If it's a parent route, we can directly get the stops
  if (routeData.ParentRoute === 0) {
    return await pool
      .request()
      .input("routeID", sql.Int, routeId)
      .query(
        `SELECT Id, StopOrder FROM ParentRouteBranchStops WHERE ParentRouteID = @routeID ORDER BY StopOrder`
      );
  }

  // If it's a sub-route, we need to get the stops between the origin and destination on the parent route
  const parentRouteId = routeData.ParentRoute;

  // Fetch the stopOrder for the origin and destination branches of the sub-route
  const stopOrderResult = await pool
    .request()
    .input("parentRouteID", sql.Int, parentRouteId)
    .input("originBranchID", sql.Int, routeData.OriginBranchID)
    .input("destinationBranchID", sql.Int, routeData.DestinationBranchID)
    .query(`
      SELECT OriginStop.StopOrder AS OriginStopOrder, DestinationStop.StopOrder AS DestinationStopOrder
      FROM ParentRouteBranchStops AS OriginStop
      JOIN ParentRouteBranchStops AS DestinationStop ON DestinationStop.ParentRouteID = OriginStop.ParentRouteID
      WHERE 
        OriginStop.BranchID = @originBranchID 
        AND DestinationStop.BranchID = @destinationBranchID
        AND OriginStop.ParentRouteID = @parentRouteID
    `);

  const stopOrderData = stopOrderResult.recordset[0];

  if (!stopOrderData) {
    throw new Error(
      "Could not find stop orders for sub-route origin and destination."
    );
  }

  const { OriginStopOrder, DestinationStopOrder } = stopOrderData;

  // Get all stops in the range (inclusive) between the origin and destination stop orders, ordered by StopOrder
  return await pool
    .request()
    .input("parentRouteID", sql.Int, parentRouteId)
    .input(
      "originStopOrder",
      sql.Int,
      Math.min(OriginStopOrder, DestinationStopOrder)
    )
    .input(
      "destinationStopOrder",
      sql.Int,
      Math.max(OriginStopOrder, DestinationStopOrder)
    ).query(`
      SELECT Id, StopOrder 
      FROM ParentRouteBranchStops
      WHERE ParentRouteID = @parentRouteID 
        AND StopOrder BETWEEN @originStopOrder AND @destinationStopOrder
      ORDER BY StopOrder
    `);
}
async function getRoutesTable(pool) {
  try {
    const result = await pool
      .request()
      .query(
        "SELECT OriginBranchid,destinationBranchid,parentRoute,subroute,Id FROM Routes"
      ); // Adjust your SQL query
    return result.recordset; // For Microsoft SQL Server
  } catch (err) {
    console.error("SQL error", err);
  }
}
// Function to get parent route branch stops
async function getParentRouteBranchStops(pool) {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM ParentRouteBranchStops"); // Adjust your SQL query
    return result.recordset; // For Microsoft SQL Server
  } catch (err) {
    console.error("SQL error", err);
  }
}
async function getRoutesbyOriginDestination(
  pool,
  originBranchID,
  destinationBranchID
) {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query(
        `SELECT Id FROM Routes where originBranchId=${originBranchID} and destinationbranchid=${destinationBranchID}`
      ); // Adjust your SQL query
    const returnResult = [];
    result.recordset.map((row) => {
      returnResult.push(row.Id);
    });

    return returnResult; // For Microsoft SQL Server
  } catch (err) {
    console.error("SQL error", err);
  }
}

module.exports = router;
