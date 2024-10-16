CREATE TABLE ParentRouteBranchStops (
    Id INT IDENTITY(1,1),  -- Auto-incrementing Id column
    ParentRouteID INT,
    BranchID INT,
    StopOrder INT,
    PRIMARY KEY (Id),  -- Set Id as the primary key
    UNIQUE (ParentRouteID, BranchID)  -- Ensure uniqueness for ParentRouteID and BranchID
);
-- Insert data for ParentRouteID: 1 (Kingston - Negril)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(1, 3, 1),  -- KGN (Kingston)
(1, 16, 2), -- ANG (Angels)
(1, 18, 3),  -- OCH (Ocho Rios)
(1, 1, 4),  -- FAL (Falmouth)
(1, 14, 5), -- MBJ (Montego Bay)
(1, 20, 6), -- LUC (Hanover)
(1, 7, 7);  -- NEG (Negril)

-- Insert data for ParentRouteID: 137 (Negril - Kingston)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(137, 7, 1),  -- NEG (Negril)
(137, 20, 2), -- LUC (Hanover)
(137, 14, 3), -- MBJ (Montego Bay)
(137, 1, 4),  -- FAL (Falmouth)
(137, 18, 5),  -- OCH (Ocho Rios)
(137, 16, 6), -- ANG (Angels)
(137, 3, 7);  -- KGN (Kingston)

-- Insert data for ParentRouteID: 317 (Port Maria - Negril)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(317, 15, 1), -- POT (Port Antonio)
(317, 12, 2), --  // Annotto Bay
(317, 13, 3), -- // Santa Cruz
(317, 18, 4),  -- // Ocho Rios
(317, 1, 5),  -- // Falmouth
(317, 14, 6), -- // Montego Bay
(317, 20, 7), -- // Hanover
(317, 7, 8);  -- // Negril

-- Insert data for ParentRouteID: 363 (Negril via South - Kingston)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(363, 73, 1), -- NEGS (Negril)
(363, 11, 2), -- SAV (Savanna La Mar)
(363, 4, 3),  -- LUA (Luana)
(363, 2, 4),  -- GUT (Gutters)
(363, 5, 5),  -- MVL (Mandeville)
(363, 17, 6), -- MPN (May Pen)
(363, 3, 7);  -- KGN (Kingston)

-- Insert data for ParentRouteID: 176 (KGN to NEGS)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(176, 3, 1),  -- KGN (Kingston)
(176, 17, 2), -- MPN (May Pen)
(176, 5, 3),  -- MVL (Mandeville)
(176, 2, 4),  -- GUT (Gutters)
(176, 4, 5),  -- LUA (Luana)
(176, 11, 6), -- SAV (Savanna La Mar)
(176, 14, 7), -- MBJ (Sangster MBJ)
(176, 73, 8); -- NEGS (Negril)

-- Insert data for ParentRouteID: 332 (NEG to POT)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(332, 7, 1),  -- NEG (Negril)
(332, 20, 2), -- LUC (Hanover)
(332, 14, 3), -- MBJ (Montego Bay)
(332, 1, 4),  -- FAL (Falmouth)
(332, 18, 5),  -- OCH (Ocho Rios)
(332, 13, 6), -- STM (Santa Cruz)
(332, 12, 7), -- ANT (Annotto Bay)
(332, 15, 8); -- POT (Port Antonio)
