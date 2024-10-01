
-- Step 1: Create the DepartureSegments table
-- CREATE TABLE DepartureSegments (
--     Id INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID
--     RouteDepartureTimeID INT NOT NULL, -- Foreign key to RouteDepartureTimes
--     ParentRouteStopsID INT NOT NULL,   -- Foreign key to ParentRouteStops
--     AvailableSeats INT NOT NULL        -- Number of available seats
-- );


DECLARE @specifiedDate DATE = '2022-08-07'; -- Change this to your desired date
DECLARE @defaultAvailableSeats INT = 42; -- Default available seats for all stops

-- Step 1: Insert into DepartureSegments for each parent route and its stops
INSERT INTO DepartureSegments (RouteDepartureTimeID, ParentRouteStopsID, AvailableSeats)
SELECT 
    rdt.RouteDepartureTimeID,         -- The RouteDepartureTime ID from the parent route
    prs.Id AS ParentRouteStopsID,      -- The corresponding stop from ParentRouteStops
    @defaultAvailableSeats AS AvailableSeats -- Set available seats to 42
FROM 
    ParentRouteBranchStops prs
JOIN 
    Routes r ON prs.ParentRouteID = r.Id     -- Fetch stops for the parent route
JOIN 
    (
        -- Subquery to get parent routes for the specified date
        SELECT 
            parentRDT.Id AS RouteDepartureTimeID,
            parentR.Id AS ParentRouteID
        FROM 
            RouteDepartureTimes parentRDT
        JOIN 
            Routes parentR ON parentRDT.RouteID = parentR.Id
        WHERE 
            parentR.ParentRoute = 0 -- Ensure it's a parent route
            AND CONVERT(DATE, parentRDT.ActivationDate) = @specifiedDate
    ) rdt ON r.Id = rdt.ParentRouteID; -- Join on parent route

-- Optionally, prevent duplicates by checking if a record already exists
-- AND NOT EXISTS (SELECT 1 FROM DepartureSegments ds WHERE ds.RouteDepartureTimeID = rdt.RouteDepartureTimeID AND ds.ParentRouteStopsID = prs.Id);
