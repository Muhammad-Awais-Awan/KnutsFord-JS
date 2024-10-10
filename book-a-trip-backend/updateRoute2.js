const sql = require("mssql");

// Configuration for connecting to your SQL Server database
const config = {
  user: "BusSystem",
  password: "BusSystem",
  database: "busSystem",
  server: "DESKTOP-JK89I6H",
  options: {
    trustServerCertificate: true, // For local development, you might need this if you're connecting locally
  },
};
// -------------------------------3-73------------------------------------
const parentRouteID = 176;
const branchNames = {
  3: "KGN", // Kingston
  17: "MPN", // May Pen
  5: "MVL", // Mandeville
  2: "GUT", // Gutters
  4: "LUA", // Luana
  11: "SAV", // Savanna La Mar
  73: "NEGS", // Negril
};
const routes = [
  { origin: 3, destination: 17 }, // KGN -> MPN
  { origin: 3, destination: 5 }, // KGN -> MVL
  { origin: 3, destination: 2 }, // KGN -> GUT
  { origin: 3, destination: 4 }, // KGN -> LUA
  { origin: 3, destination: 11 }, // KGN -> SAV
  // { origin: 3, destination: 73 },   // KGN -> NEGS

  { origin: 17, destination: 5 }, // MPN -> MVL
  { origin: 17, destination: 2 }, // MPN -> GUT
  { origin: 17, destination: 4 }, // MPN -> LUA
  { origin: 17, destination: 11 }, // MPN -> SAV
  { origin: 17, destination: 73 }, // MPN -> NEGS

  { origin: 5, destination: 2 }, // MVL -> GUT
  { origin: 5, destination: 4 }, // MVL -> LUA
  { origin: 5, destination: 11 }, // MVL -> SAV
  { origin: 5, destination: 73 }, // MVL -> NEGS

  { origin: 2, destination: 4 }, // GUT -> LUA
  { origin: 2, destination: 11 }, // GUT -> SAV
  { origin: 2, destination: 73 }, // GUT -> NEGS

  { origin: 4, destination: 11 }, // LUA -> SAV
  { origin: 4, destination: 73 }, // LUA -> NEGS

  { origin: 11, destination: 73 }, // SAV -> NEGS
];

// ----------------------------73-3-------------------------------------
// const parentRouteID = 363;
// // Branch names mapped to their IDs
// const branchNames = {
//   73: "NEGS",
//   11: "SAV",
//   4: "LUA",
//   2: "GUT",
//   5: "MVL",
//   17: "MPN",
//   3: "KGN",
// };

// // List of routes to insert (OriginBranchId, DestinationBranchId)
// const routes = [
//   { origin: 73, destination: 11 }, // NEGS -> SAV
//   { origin: 73, destination: 4 }, // NEGS -> LUA
//   { origin: 73, destination: 2 }, // NEGS -> GUT
//   { origin: 73, destination: 5 }, // NEGS -> MVL
//   { origin: 73, destination: 17 }, // NEGS -> MPN
//   // { origin: 73, destination: 3 },   // NEGS -> KGN

//   { origin: 11, destination: 4 }, // SAV -> LUA
//   { origin: 11, destination: 2 }, // SAV -> GUT
//   { origin: 11, destination: 5 }, // SAV -> MVL
//   { origin: 11, destination: 17 }, // SAV -> MPN
//   { origin: 11, destination: 3 }, // SAV -> KGN

//   { origin: 4, destination: 2 }, // LUA -> GUT
//   { origin: 4, destination: 5 }, // LUA -> MVL
//   { origin: 4, destination: 17 }, // LUA -> MPN
//   { origin: 4, destination: 3 }, // LUA -> KGN

//   { origin: 2, destination: 5 }, // GUT -> MVL
//   { origin: 2, destination: 17 }, // GUT -> MPN
//   { origin: 2, destination: 3 }, // GUT -> KGN

//   { origin: 5, destination: 17 }, // MVL -> MPN
//   { origin: 5, destination: 3 }, // MVL -> KGN

//   { origin: 17, destination: 3 }, // MPN -> KGN
// ];

//------------------------------3-7------------------------------------------
// const parentRouteID = 1;
// // Branch names mapped to their IDs
// const branchNames = {
//   3: "KGN",
//   16: "ANG",
//   18: "OCH",
//   1: "FAL",
//   14: "MBJ",
//   20: "LUC",
//   7: "NEG",
// };

// // List of routes to insert (OriginBranchId, DestinationBranchId)
// const routes = [
//   { origin: 3, destination: 16 }, // KGN -> ANG
//   { origin: 3, destination: 18 }, // KGN -> OCH
//   { origin: 3, destination: 1 }, // KGN -> FAL
//   { origin: 3, destination: 14 }, // KGN -> MBJ
//   { origin: 3, destination: 20 }, // KGN -> LUC

//   { origin: 16, destination: 18 }, // ANG -> OCH
//   { origin: 16, destination: 1 }, // ANG -> FAL
//   { origin: 16, destination: 14 }, // ANG -> MBJ
//   { origin: 16, destination: 20 }, // ANG -> LUC
//   { origin: 16, destination: 7 }, // ANG -> NEG

//   { origin: 18, destination: 1 }, // OCH -> FAL
//   { origin: 18, destination: 14 }, // OCH -> MBJ
//   { origin: 18, destination: 20 }, // OCH -> LUC
//   { origin: 18, destination: 7 }, // OCH -> NEG

//   { origin: 1, destination: 14 }, // FAL -> MBJ
//   { origin: 1, destination: 20 }, // FAL -> LUC
//   { origin: 1, destination: 7 }, // FAL -> NEG

//   { origin: 14, destination: 20 }, // MBJ -> LUC
//   { origin: 14, destination: 7 }, // MBJ -> NEG

//   { origin: 20, destination: 7 }, // LUC -> NEG
// ];
//------------------------------7-3-------------------------------------------
// const parentRouteID = 137;
// const branchNames = {
//   7: "NEG", // Negril
//   20: "LUC", // Hanover
//   14: "MBJ", // Montego Bay
//   1: "FAL", // Falmouth
//   18: "OCH", // Ocho Rios
//   16: "ANG", // Angels
//   3: "KGN", // Kingston
// };
// const routes = [
//   { origin: 7, destination: 20 }, // NEG -> LUC
//   { origin: 7, destination: 14 }, // NEG -> MBJ
//   { origin: 7, destination: 1 }, // NEG -> FAL
//   { origin: 7, destination: 18 }, // NEG -> OCH
//   { origin: 7, destination: 16 }, // NEG -> ANG
//   // { origin: 7, destination: 3 },   // NEG -> KGN ParentRoute

//   { origin: 20, destination: 14 }, // LUC -> MBJ
//   { origin: 20, destination: 1 }, // LUC -> FAL
//   { origin: 20, destination: 18 }, // LUC -> OCH
//   { origin: 20, destination: 16 }, // LUC -> ANG
//   { origin: 20, destination: 3 }, // LUC -> KGN

//   { origin: 14, destination: 1 }, // MBJ -> FAL
//   { origin: 14, destination: 18 }, // MBJ -> OCH
//   { origin: 14, destination: 16 }, // MBJ -> ANG
//   { origin: 14, destination: 3 }, // MBJ -> KGN

//   { origin: 1, destination: 18 }, // FAL -> OCH
//   { origin: 1, destination: 16 }, // FAL -> ANG
//   { origin: 1, destination: 3 }, // FAL -> KGN

//   { origin: 18, destination: 16 }, // OCH -> ANG
//   { origin: 18, destination: 3 }, // OCH -> KGN

//   { origin: 16, destination: 3 }, // ANG -> KGN
// ];
//------------------------------7-15---------------------------------------------
// const parentRouteID = 332;
// const branchNames = {
//   7: "NEG", // Negril
//   20: "LUC", // Hanover
//   14: "MBJ", // Montego Bay
//   1: "FAL", // Falmouth
//   18: "OCH", // Ocho Rios
//   13: "STM", // Santa Cruz
//   12: "ANT", // Annotto Bay
//   15: "POT", // Port Antonio
// };
// const routes = [
//   { origin: 7, destination: 20 }, // NEG -> LUC
//   { origin: 7, destination: 14 }, // NEG -> MBJ
//   { origin: 7, destination: 1 }, // NEG -> FAL
//   { origin: 7, destination: 18 }, // NEG -> OCH
//   { origin: 7, destination: 13 }, // NEG -> STM
//   { origin: 7, destination: 12 }, // NEG -> ANT
//   // { origin: 7, destination: 15 },   // NEG -> POT parent Route

//   { origin: 20, destination: 14 }, // LUC -> MBJ
//   { origin: 20, destination: 1 }, // LUC -> FAL
//   { origin: 20, destination: 18 }, // LUC -> OCH
//   { origin: 20, destination: 13 }, // LUC -> STM
//   { origin: 20, destination: 12 }, // LUC -> ANT
//   { origin: 20, destination: 15 }, // LUC -> POT

//   { origin: 14, destination: 1 }, // MBJ -> FAL
//   { origin: 14, destination: 18 }, // MBJ -> OCH
//   { origin: 14, destination: 13 }, // MBJ -> STM
//   { origin: 14, destination: 12 }, // MBJ -> ANT
//   { origin: 14, destination: 15 }, // MBJ -> POT

//   { origin: 1, destination: 18 }, // FAL -> OCH
//   { origin: 1, destination: 13 }, // FAL -> STM
//   { origin: 1, destination: 12 }, // FAL -> ANT
//   { origin: 1, destination: 15 }, // FAL -> POT

//   { origin: 18, destination: 13 }, // OCH -> STM
//   { origin: 18, destination: 12 }, // OCH -> ANT
//   { origin: 18, destination: 15 }, // OCH -> POT

//   { origin: 13, destination: 12 }, // STM -> ANT
//   { origin: 13, destination: 15 }, // STM -> POT

//   { origin: 12, destination: 15 }, // ANT -> POT
// ];

//-------------------------------15-7-------------------------------------------------
// const parentRouteID = 317;
// const branchNames = {
//   15: "POT", // Port Antonio
//   12: "ANT", // Annotto Bay
//   13: "STM", // Santa Cruz
//   18: "OCH", // Ocho Rios
//   1: "FAL", // Falmouth
//   14: "MBJ", // Montego Bay
//   20: "LUC", // Hanover
//   7: "NEG", // Negril
// };
// const routes = [
//   { origin: 15, destination: 12 }, // POT -> ANT
//   { origin: 15, destination: 13 }, // POT -> STM
//   { origin: 15, destination: 18 }, // POT -> OCH
//   { origin: 15, destination: 1 }, // POT -> FAL
//   { origin: 15, destination: 14 }, // POT -> MBJ
//   { origin: 15, destination: 20 }, // POT -> LUC
//   { origin: 15, destination: 7 }, // POT -> NEG

//   { origin: 12, destination: 13 }, // ANT -> STM
//   { origin: 12, destination: 18 }, // ANT -> OCH
//   { origin: 12, destination: 1 }, // ANT -> FAL
//   { origin: 12, destination: 14 }, // ANT -> MBJ
//   { origin: 12, destination: 20 }, // ANT -> LUC
//   { origin: 12, destination: 7 }, // ANT -> NEG

//   { origin: 13, destination: 18 }, // STM -> OCH
//   { origin: 13, destination: 1 }, // STM -> FAL
//   { origin: 13, destination: 14 }, // STM -> MBJ
//   { origin: 13, destination: 20 }, // STM -> LUC
//   { origin: 13, destination: 7 }, // STM -> NEG

//   { origin: 18, destination: 1 }, // OCH -> FAL
//   { origin: 18, destination: 14 }, // OCH -> MBJ
//   { origin: 18, destination: 20 }, // OCH -> LUC
//   { origin: 18, destination: 7 }, // OCH -> NEG

//   { origin: 1, destination: 14 }, // FAL -> MBJ
//   { origin: 1, destination: 20 }, // FAL -> LUC
//   { origin: 1, destination: 7 }, // FAL -> NEG

//   { origin: 14, destination: 20 }, // MBJ -> LUC
//   { origin: 14, destination: 7 }, // MBJ -> NEG

//   { origin: 20, destination: 7 }, // LUC -> NEG
// ];

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
  ParentRoute: parentRouteID,
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
