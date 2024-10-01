const sql = require("mssql");

// Configuration for connecting to your SQL Server database
const config = {
  user: "BusSystem",
  password: "BusSystem",
  database: "busSystem",
  server: "DESKTOP-F20I78T",
  options: {
    trustServerCertificate: true, // For local development, you might need this if you're connecting locally
  },
};

// List of routes to insert (OriginBranchId, DestinationBranchId)
const routes = [
  { origin: 74, destination: 11 },
  { origin: 74, destination: 4 },
  { origin: 74, destination: 2 },
  { origin: 74, destination: 5 },
  { origin: 74, destination: 17 },
  // { origin: 74, destination: 3 }, -- ParentRoute
  { origin: 11, destination: 4 },
  { origin: 11, destination: 2 },
  { origin: 11, destination: 5 },
  { origin: 11, destination: 17 },
  { origin: 11, destination: 3 },
  { origin: 4, destination: 2 },
  { origin: 4, destination: 5 },
  { origin: 4, destination: 17 },
  { origin: 4, destination: 3 },
  { origin: 2, destination: 5 },
  { origin: 2, destination: 17 },
  { origin: 2, destination: 3 },
  { origin: 5, destination: 17 },
  { origin: 5, destination: 3 },
  { origin: 17, destination: 3 },
];

// Common values for all routes
const commonValues = {
  EstimatedDriveTimeInMinutes: 60,
  DepartureTerminal: "Your Departure Terminal",
  ArrivalTerminal: "Your Arrival Terminal",
  PublishToMobile: true,
  PublishToWebsite: true,
  PublishToAPI: true,
  PublishToB2B: true,
  IsException: false,
  ColorCode: "#cece",
  Enabled: true,
  BaseRoute: true,
  BaseRouteId: 0,
  FrequencyRank: 1000,
  ParentRoute: 299,
  SubRoute: 1,
};

// Function to insert or update routes
async function upsertRoutes() {
  try {
    console.log("SCRIPT STARTED ✅");
    // Connect to the database
    await sql.connect(config);
    console.log("DATABASE CONNECTED ✅");

    for (const route of routes) {
      const originName = branchNames[route.origin];
      const destinationName = branchNames[route.destination];

      const label = `${originName} to ${destinationName}`;
      const code = `${originName}-${destinationName}`;

      // Check if the route already exists and whether it has a ParentRoute
      const result = await sql.query`SELECT ParentRoute FROM Routes 
                                     WHERE OriginBranchId = ${route.origin} 
                                     AND DestinationBranchId = ${route.destination}`;

      if (result.recordset.length > 0) {
        const existingParentRoute = result.recordset[0].ParentRoute;

        if (
          existingParentRoute !== null &&
          existingParentRoute !== parentRouteID
        ) {
          // If the route exists and already has a different ParentRoute, create a new route with the new ParentRoute
          await sql.query`INSERT INTO Routes (Label, Code, OriginBranchId, DestinationBranchId, EstimatedDriveTimeInMinutes,
                                              DepartureTerminal, ArrivalTerminal, PublishToMobile, PublishToWebsite, 
                                              PublishToAPI, PublishToB2B, IsException, ColorCode, Enabled, BaseRoute, 
                                              BaseRouteId, DateCreated, FrequencyRank, ParentRoute, SubRoute)
                          VALUES (${label}, ${code}, ${route.origin}, ${route.destination}, 
                                  ${commonValues.EstimatedDriveTimeInMinutes}, ${commonValues.DepartureTerminal}, 
                                  ${commonValues.ArrivalTerminal}, ${commonValues.PublishToMobile}, 
                                  ${commonValues.PublishToWebsite}, ${commonValues.PublishToAPI}, 
                                  ${commonValues.PublishToB2B}, ${commonValues.IsException}, ${commonValues.ColorCode}, 
                                  ${commonValues.Enabled}, ${commonValues.BaseRoute}, ${commonValues.BaseRouteId}, 
                                  GETDATE(), ${commonValues.FrequencyRank}, ${parentRouteID}, ${commonValues.SubRoute})`;
          console.log(
            `${label} created with new ParentRoute ${parentRouteID} ✅`
          );
        } else {
          // If the route exists but doesn't have a ParentRoute or has the same ParentRoute, update it
          await sql.query`UPDATE Routes
                          SET SubRoute = 1, ParentRoute = ${parentRouteID}
                          WHERE OriginBranchId = ${route.origin}
                          AND DestinationBranchId = ${route.destination}`;
          console.log(`${label} updated with ParentRoute ${parentRouteID} ✅`);
        }
      } else {
        // Route does not exist, insert a new one
        await sql.query`INSERT INTO Routes (Label, Code, OriginBranchId, DestinationBranchId, EstimatedDriveTimeInMinutes,
                                            DepartureTerminal, ArrivalTerminal, PublishToMobile, PublishToWebsite, 
                                            PublishToAPI, PublishToB2B, IsException, ColorCode, Enabled, BaseRoute, 
                                            BaseRouteId, DateCreated, FrequencyRank, ParentRoute, SubRoute)
                        VALUES (${label}, ${code}, ${route.origin}, ${route.destination}, 
                                ${commonValues.EstimatedDriveTimeInMinutes}, ${commonValues.DepartureTerminal}, 
                                ${commonValues.ArrivalTerminal}, ${commonValues.PublishToMobile}, 
                                ${commonValues.PublishToWebsite}, ${commonValues.PublishToAPI}, 
                                ${commonValues.PublishToB2B}, ${commonValues.IsException}, ${commonValues.ColorCode}, 
                                ${commonValues.Enabled}, ${commonValues.BaseRoute}, ${commonValues.BaseRouteId}, 
                                GETDATE(), ${commonValues.FrequencyRank}, ${parentRouteID}, ${commonValues.SubRoute})`;
        console.log(`${label} successfully created ✅`);
      }
    }
  } catch (err) {
    console.error("Error processing routes:", err);
  } finally {
    // Close the database connection
    console.log("Script Completed Successfully ✅");
    sql.close();
  }
}

// Execute the upsert function
upsertRoutes();
