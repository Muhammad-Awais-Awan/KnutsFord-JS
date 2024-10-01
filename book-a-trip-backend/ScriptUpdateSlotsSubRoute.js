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
// Function to assign slots
async function assignSlots() {
  try {
    // Connect to the database
    let pool = await sql.connect(config);
    console.log("Connected to the database.");

    // Step 1: Fetch subroutes that need slot assignment
    const subRoutesQuery = `
      SELECT 
        rd.Id AS SubRouteRecordId, 
        rd.RouteId AS SubRouteId, 
        r.ParentRoute, 
        CONVERT(DATE, rd.ActivationDate) AS ActivationDate
      FROM 
        RouteDepartureTimes rd
      JOIN 
        Routes r ON rd.RouteId = r.Id
      WHERE 
       CONVERT(DATE, rd.ActivationDate) >= '2025-08-04' 
        AND CONVERT(DATE, rd.ActivationDate) <= '2025-08-05' AND
        rd.RouteId=10 AND
        r.SubRoute = 1; -- Only considering subroutes
    `;

    const parentSlotsQuery = `
      SELECT 
        rd.RouteId AS ParentRouteId, 
        rd.Slot, 
        CONVERT(DATE, rd.ActivationDate) AS ActivationDate
      FROM 
        RouteDepartureTimes rd
      WHERE 
        CONVERT(DATE, rd.ActivationDate) >= '2025-08-04' 
        AND CONVERT(DATE, rd.ActivationDate) <= '2025-08-05'
        AND rd.RouteId IN (1, 137, 165, 299, 324, 325); -- Parent Route IDs
    `;

    // Fetch subroutes and parent route slots in parallel
    const [subRoutesResult, parentSlotsResult] = await Promise.all([
      pool.request().query(subRoutesQuery),
      pool.request().query(parentSlotsQuery),
    ]);

    const subRoutes = subRoutesResult.recordset;
    const parentSlots = parentSlotsResult.recordset;

    // Step 2: Create a map of parent routes with their slots, grouped by activation date
    const parentRouteSlotMap = new Map();

    parentSlots.forEach((ps) => {
      const key = `${ps.ParentRouteId}-${ps.ActivationDate}`;
      if (!parentRouteSlotMap.has(key)) {
        parentRouteSlotMap.set(key, []);
      }
      parentRouteSlotMap.get(key).push(ps.Slot);
    });
    console.log(parentRouteSlotMap, "PARENT ROUTE SLOT MAP");
    // Step 3: Assign unique slots to subroutes
    const updates = [];

    subRoutes.forEach((subRoute) => {
      const key = `${subRoute.ParentRoute}-${subRoute.ActivationDate}`;
      const availableSlots = parentRouteSlotMap.get(key);
      console.log(subRoute, "SUB ROUTES");
      if (availableSlots && availableSlots.length > 0) {
        // Assign the first available slot
        const assignedSlot = availableSlots.shift(); // Get the slot and remove it from the array

        //     // Prepare update query for batch execution
        updates.push({
          query: `
            UPDATE RouteDepartureTimes
            SET Slot = @Slot
            WHERE Id = @SubRouteRecordId AND CONVERT(DATE, ActivationDate) = @ActivationDate;
          `,
          params: {
            Slot: assignedSlot,
            SubRouteRecordId: subRoute.SubRouteRecordId,
            ActivationDate: subRoute.ActivationDate,
          },
        });

        console.log(
          `Assigned Slot ${assignedSlot} to SubRoute ID: ${subRoute.SubRouteRecordId}`
        );
      } else {
        console.log(
          `No available slots for SubRoute ID: ${subRoute.SubRouteRecordId} on ${subRoute.ActivationDate}`
        );
      }
    });

    // Step 4: Batch update slots for subroutes
    if (updates.length > 0) {
      const transaction = new sql.Transaction(pool);

      await transaction.begin(); // Begin transaction
      try {
        const request = transaction.request();
        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];

          // Use unique parameter names by appending the index (i)
          await request
            .input(`Slot_${i}`, sql.Int, update.params.Slot)
            .input(
              `SubRouteRecordId_${i}`,
              sql.Int,
              update.params.SubRouteRecordId
            )
            .input(
              `ActivationDate_${i}`,
              sql.Date,
              update.params.ActivationDate
            )
            .query(
              update.query
                .replace("@Slot", `@Slot_${i}`)
                .replace("@SubRouteRecordId", `@SubRouteRecordId_${i}`)
                .replace("@ActivationDate", `@ActivationDate_${i}`)
            );
        }
        await transaction.commit(); // Commit transaction if all queries succeed
        console.log("Slots assigned and updated successfully.");
      } catch (error) {
        await transaction.rollback(); // Rollback transaction if any query fails
        console.error("Error during slot assignment, rolling back:", error);
      }
    }
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    // Close the database connection
    await sql.close();
  }
}

// Run the function
assignSlots();
