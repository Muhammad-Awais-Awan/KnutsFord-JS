-- ;WITH SlotAssignment AS (
--     SELECT 
--         Id,
--         RouteId,
--         ActivationDate,
--         ROW_NUMBER() OVER (PARTITION BY CAST(ActivationDate AS DATE), RouteId ORDER BY Id) AS Slot
--     FROM 
--         RouteDepartureTimes
--     WHERE 
--         ActivationDate IS NOT NULL
-- )
-- UPDATE RouteDepartureTimes
-- SET Slot = SlotAssignment.Slot
-- FROM SlotAssignment
-- WHERE RouteDepartureTimes.Id = SlotAssignment.Id;
------------BREAKING
-- Step 1: Create a Common Table Expression (CTE) to generate slot numbers
-- Step 1: Create a Common Table Expression (CTE) to generate slot numbers for specific RouteIds
-- ;WITH SlotAssignment AS (
--     SELECT 
--         Id, -- The unique identifier for the RouteDepartureTime record
--         RouteId, -- The ID of the route
--         ActivationDate, -- The activation date for this route
--         ROW_NUMBER() OVER (PARTITION BY CAST(ActivationDate AS DATE), RouteId ORDER BY Id) AS Slot
--         -- ROW_NUMBER assigns a sequential integer to each row within a partition
--         -- The partition is by ActivationDate (ignoring the time) and RouteId
--     FROM 
--         RouteDepartureTimes
--     WHERE 
--         ActivationDate IS NOT NULL -- Exclude rows where ActivationDate is null
--         AND RouteId IN (1, 137, 165, 299, 324, 325) -- Filter for parent route IDs
-- )
-- SELECT * FROM SlotAssignment; -- This will show you the temporary result with assigned slots
-- -- Step 2: Update the Slot column in RouteDepartureTimes using the CTE
-- UPDATE RouteDepartureTimes
-- SET Slot = SlotAssignment.Slot -- Set the Slot in RouteDepartureTimes to the calculated Slot
-- FROM SlotAssignment
-- WHERE RouteDepartureTimes.Id = SlotAssignment.Id; -- Ensure we match the correct rows based on Id
-- Step 1: Create a Common Table Expression (CTE) to generate slot numbers and then update the Slot column
;WITH SlotAssignment AS (
    SELECT 
        Id, -- The unique identifier for the RouteDepartureTime record
        RouteId, -- The ID of the route
        ActivationDate, -- The activation date for this route
        ROW_NUMBER() OVER (PARTITION BY CAST(ActivationDate AS DATE), RouteId ORDER BY Id) AS Slot
    FROM 
        RouteDepartureTimes
    WHERE 
        ActivationDate IS NOT NULL 
        AND RouteId IN (1, 137, 165, 299, 324, 325) -- Only consider specific Parent Route IDs
)

-- Step 2: Update the RouteDepartureTimes table with the calculated Slot values
UPDATE RouteDepartureTimes
SET Slot = SlotAssignment.Slot
FROM SlotAssignment
WHERE RouteDepartureTimes.Id = SlotAssignment.Id;
