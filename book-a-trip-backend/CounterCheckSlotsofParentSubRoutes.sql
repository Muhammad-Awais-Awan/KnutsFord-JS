SELECT 
    rdt.Id AS RouteDepartureTimeID,
    rdt.RouteID,
    rdt.Slot AS AssignedSlot,
    rdt.ActivationDate AS Date,
    r.Code AS RouteCode,
    r.ParentRoute AS ParentRouteID,
    CASE 
        WHEN r.ParentRoute = 0 THEN 'Parent Route'
        ELSE 'Sub Route'
    END AS RouteType,
    parentRDT.Id AS ParentRouteDepartureTimeID,
    parentRDT.Slot AS ParentRouteSlot,
    parentR.Code AS ParentRouteCode
FROM 
    RouteDepartureTimes rdt
JOIN 
    Routes r ON rdt.RouteID = r.Id
LEFT JOIN 
    Routes parentR ON r.ParentRoute = parentR.Id -- Get the parent route if exists
LEFT JOIN 
    RouteDepartureTimes parentRDT ON parentRDT.RouteID = parentR.Id 
        AND CONVERT(DATE, parentRDT.ActivationDate) = CONVERT(DATE, rdt.ActivationDate) -- Match on the same date
WHERE 
    CONVERT(DATE, rdt.ActivationDate) = '2022-08-07' -- Specific date
ORDER BY 
    COALESCE(parentR.Id, r.Id), -- ParentRoute comes first
    r.ParentRoute,              -- Then Subroutes follow their ParentRoute
    rdt.RouteID;
