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

async function getRoutesbyOriginDestination(
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

// Close the SQL connection (optional: you may want to handle this gracefully in your application)
process.on("exit", () => {
  sql.close();
});
class RouteFinder {
  constructor(routesTable, parentRouteBranchStops) {
    this.routesTable = routesTable; // Contains route information
    this.parentRouteBranchStops = parentRouteBranchStops; // Contains stops and travel times
    this.adjacencyList = this.buildAdjacencyList();
  }

  // Build an adjacency list for the graph representation
  buildAdjacencyList() {
    const adjacencyList = {};

    // Loop through each route
    for (const route of this.routesTable) {
      if (route.subRoute) continue; // Only focus on Parent routes

      const routeStops = this.parentRouteBranchStops
        .filter((stop) => stop.ParentRouteID === route.Id)
        .sort((a, b) => a.StopOrder - b.StopOrder);

      // Build adjacency list for each stop in the route
      for (let i = 0; i < routeStops.length; i++) {
        const currentStop = routeStops[i];
        const currentBranchID = currentStop.BranchID;

        if (!adjacencyList[currentBranchID]) {
          adjacencyList[currentBranchID] = [];
        }

        // Add edges for the current stop to the next stop
        if (i < routeStops.length - 1) {
          const nextStop = routeStops[i + 1];
          const travelTime = nextStop.TravelTimeFromPreviousStop || 0;
          adjacencyList[currentBranchID].push({
            branchID: nextStop.BranchID,
            travelTime,
          });
        }
      }
    }
    console.log("INITIALIZING ADJANCEY LIST : ", adjacencyList);
    return adjacencyList;
  }

  // Dijkstra's algorithm to find the shortest path
  findShortestPath(startBranch, endBranch) {
    const distances = {};
    const previousStops = {};
    const priorityQueue = new MinPriorityQueue(); // Assuming you have a priority queue implementation

    // Initialize distances and add start point to the queue
    for (const stop in this.adjacencyList) {
      distances[stop] = Infinity;
      previousStops[stop] = null;
    }
    distances[startBranch] = 0;
    priorityQueue.enqueue(startBranch, 0);

    while (!priorityQueue.isEmpty()) {
      console.log("MINIMUM PRIORITY QUEUE : ", priorityQueue);
      const currentStop = priorityQueue.dequeue().element;

      // If we reached the end branch, break out
      if (currentStop === endBranch) {
        break;
      }

      // Traverse the neighbors
      for (const neighbor of this.adjacencyList[currentStop]) {
        const newDistance = distances[currentStop] + neighbor.travelTime;

        if (newDistance < distances[neighbor.branchID]) {
          distances[neighbor.branchID] = newDistance;
          previousStops[neighbor.branchID] = currentStop;
          priorityQueue.enqueue(neighbor.branchID, newDistance);
        }
      }
    }

    // Build the path from the previous stops
    const path = [];
    let current = endBranch;
    while (current) {
      path.unshift(current);
      current = previousStops[current];
    }

    return {
      travelTime: distances[endBranch],
      path: path.length > 1 ? path : [], // Ensure a valid path is returned
    };
  }

  // Function to recursively find all routes from the current stop
  findAllRoutes(
    currentStop,
    endBranch,
    path = [],
    travelTime = 0,
    routes = []
  ) {
    path.push(currentStop);

    // Check if we reached the destination
    if (currentStop === endBranch) {
      routes.push({ path: [...path], travelTime }); // Store path and its travel time
    } else {
      // Traverse all neighbors
      for (const neighbor of this.adjacencyList[currentStop]) {
        if (!path.includes(neighbor.branchID)) {
          this.findAllRoutes(
            neighbor.branchID,
            endBranch,
            path,
            travelTime + neighbor.travelTime, // Add travel time to current path
            routes
          );
        }
      }
    }

    path.pop(); // Backtrack
    return routes;
  }

  // Main function to find the optimal route from origin to destination
  async findRoute(originBranchID, destinationBranchID) {
    console.log(
      `Finding route from ${originBranchID} to ${destinationBranchID}`
    );

    const shortestPath = this.findShortestPath(
      originBranchID,
      destinationBranchID
    );
    console.log(
      `Shortest path found: ${shortestPath.path.join(
        " -> "
      )} with travel time: ${shortestPath.travelTime} minutes`
    );

    // Find all routes
    const allRoutes = this.findAllRoutes(originBranchID, destinationBranchID);

    console.log("All possible routes:");
    allRoutes.forEach((route, index) => {
      console.log(
        `Route ${index + 1}: ${route.path.join(" -> ")}, Travel time: ${
          route.travelTime
        } minutes`
      );
    });

    return {
      shortestPath: shortestPath,
      allRoutes: allRoutes,
      travelSegments: await this.getTravelSegments(shortestPath.path),
    };
  }
  // New method to get travel segments
  async getTravelSegments(optimalRoute) {
    const travelSegments = [];
    let currentSegment = [];
    const interchangeBranches = new Set();

    for (let i = 0; i < optimalRoute.length; i++) {
      const currentBranch = optimalRoute[i];
      currentSegment.push(currentBranch);

      // Check if the current branch is an interchange
      const isInterchange = this.parentRouteBranchStops.some(
        (stop) => stop.BranchID === currentBranch && stop.IsInterchange
      );

      if (isInterchange || i === optimalRoute.length - 1) {
        if (currentSegment.length > 1) {
          travelSegments.push(currentSegment);
        }
        currentSegment = [currentBranch]; // Start a new segment
      }
    }

    const subRoutes = [];
    for (const segment of travelSegments) {
      const startBranch = segment[0];
      const endBranch = segment[segment.length - 1];

      // Fetch the route ID for the segment from start to end branch
      const routeID = await getRoutesbyOriginDestination(
        startBranch,
        endBranch
      );

      subRoutes.push({
        start: startBranch,
        end: endBranch,
        branches: segment,
        routeID: routeID,
      });
    }

    return subRoutes;
  }
}

// Usage Example
async function runRouteFinder(userSelectedOriginID, userSelectedDestinationID) {
  const routesTable = await getRoutesTable(); // Fetch from database
  const parentRouteBranchStops = await getParentRouteBranchStops(); // Fetch from database

  const routeFinder = new RouteFinder(routesTable, parentRouteBranchStops);
  const result = await routeFinder.findRoute(
    userSelectedOriginID,
    userSelectedDestinationID
  );

  console.log("Shortest route:", result.shortestPath);
  console.log(
    "Total travel time for shortest route:",
    result.shortestPath.travelTime
  );
  console.log("Travel Segments: ", result.travelSegments);
}

// // Example usage
// const userSelectedOriginID = 73; // Gutters
// const userSelectedDestinationID = 15; // Pot
// runRouteFinder(userSelectedOriginID, userSelectedDestinationID);

class MinPriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(element, priority) {
    this.queue.push({ element, priority });
    this.sortQueue();
  }

  dequeue() {
    return this.queue.shift(); // Removes and returns the first element (the smallest priority)
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  sortQueue() {
    this.queue.sort((a, b) => a.priority - b.priority); // Sort by priority (smallest first)
  }
}
module.exports = RouteFinder; // Properly export the class
