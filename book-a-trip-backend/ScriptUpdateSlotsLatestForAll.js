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

// Utility function to format date to `YYYY-MM-DD`
function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

// Function to fetch parent routes for a given date
async function getParentRoutesForDate() {
  try {
    const query = `
      SELECT rdt.*, r.ParentRoute
      FROM RouteDepartureTimes rdt
      JOIN Routes r ON rdt.RouteID = r.Id
      WHERE r.ParentRoute=0;
    `;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching parent routes:", err);
    throw err;
  }
}

// Function to fetch subroutes for a given date
async function getSubRoutesForDate() {
  try {
    const query = `
      SELECT rdt.*, r.ParentRoute, r.subRoute
      FROM RouteDepartureTimes rdt
      JOIN Routes r ON rdt.RouteID = r.Id
      WHERE r.subRoute=1;
    `;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error fetching subroutes:", err);
    throw err;
  }
}

// Function to update the slot for a subroute in the database
async function updateSubRouteSlot(subRouteId, slot) {
  try {
    const query = `
      UPDATE RouteDepartureTimes
      SET Slot = @slot
      WHERE id = @subRouteId;
    `;
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("slot", sql.Int, slot)
      .input("subRouteId", sql.Int, subRouteId)
      .query(query);
    console.log(`Assigned Slot ${slot} to SubRoute ID ${subRouteId}`);
  } catch (err) {
    console.error(`Error updating slot for subRoute ID ${subRouteId}:`, err);
    throw err;
  }
}

// Function to assign slots to subroutes based on parent routes
async function assignSlots() {
  try {
    // Fetch parent routes and subroutes for the given date
    const parentRoutes = await getParentRoutesForDate();
    const subRoutes = await getSubRoutesForDate();
    // console.log("PARENT ROUTES:", parentRoutes);
    // console.log("SUB ROUTES:", subRoutes);

    // Map to store available slots per parent route on a given date
    const slotMap = new Map();

    // Track subroute occurrences (keyed by subroute ID and date)
    const subrouteSlotCounter = new Map();

    // Step 1: Prepare unique slots for parent routes
    parentRoutes.forEach((parentRoute, index) => {
      const key = `${parentRoute.RouteId}-${formatDate(
        parentRoute.ActivationDate
      )}`;
      const uniqueSlot = parentRoute.Slot; // Ensure parent routes get unique slots
      if (!slotMap.has(key)) {
        slotMap.set(key, []);
      }
      // Assign a unique slot to this parent route
      // parentRoute.Slot = uniqueSlot;
      slotMap.get(key).push(uniqueSlot);
    });
    console.log("SLOTMAP:", slotMap);

    // Step 2: Assign slots to subroutes
    for (let subroute of subRoutes) {
      const parentKey = `${subroute.ParentRoute}-${formatDate(
        subroute.ActivationDate
      )}`;

      // console.log("PARENT KEY:", parentKey, subroute.ParentRoute);
      const subrouteKey = `${subroute.RouteId}-${formatDate(
        subroute.ActivationDate
      )}`;

      // Ensure the subrouteSlotCounter tracks occurrences
      if (!subrouteSlotCounter.has(subrouteKey)) {
        subrouteSlotCounter.set(subrouteKey, 0); // Initialize count
      }

      let assignedSlot;
      const occurrenceCount = subrouteSlotCounter.get(subrouteKey);

      // Step 3: Assign the same slot as the parent on the first occurrence
      if (slotMap.has(parentKey)) {
        const parentSlots = slotMap.get(parentKey);
        if (occurrenceCount === 0 && parentSlots.length > 0) {
          assignedSlot = parentSlots[0]; // Assign parent route's first slot
          // parentSlots.shift()
        } else if (parentSlots.length > occurrenceCount) {
          // If subroute repeats, assign the next available parent slot
          assignedSlot = parentSlots[occurrenceCount];
        } else {
          // Default fallback in case there aren't enough parent slots
          assignedSlot = -1;
        }
      } else {
        // If no parent route is found, assign 0 as the slot
        assignedSlot = 0;
      }

      // Update the counter for subroute occurrences
      subrouteSlotCounter.set(subrouteKey, occurrenceCount + 1);

      // Assign the slot to the subroute
      if (assignedSlot !== undefined) {
        subroute.Slot = assignedSlot;

        // Update the subroute slot in the database
        await updateSubRouteSlot(subroute.Id, assignedSlot);
      }
    }
  } catch (err) {
    console.error("Error during slot assignment:", err);
  }
}


assignSlots()
  .then(() => {
    console.log("Slot assignment completed.");
  })
  .catch((err) => {
    console.error("Error during slot assignment process:", err);
  });
