CREATE TABLE ParentRouteBranchStops (
    ParentRouteID INT,
    BranchID INT,
    StopOrder INT,
    PRIMARY KEY (ParentRouteID, BranchID)
);
-- Insert data for ParentRouteID: 1 (Kingston - Negril)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(1, 3, 1),  -- KGN (Kingston)
(1, 16, 2), -- ANG (Angels)
(1, 8, 3),  -- OCH (Ocho Rios)
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
(137, 8, 5),  -- OCH (Ocho Rios)
(137, 16, 6), -- ANG (Angels)
(137, 3, 7);  -- KGN (Kingston)

-- Insert data for ParentRouteID: 165 (Port Maria - Negril)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(165, 13, 1), -- POT (Port Antonio)
(165, 15, 2), --  // Annotto Bay
(165, 10, 3), -- // Santa Cruz
(165, 8, 4),  -- // Ocho Rios
(165, 1, 5),  -- // Falmouth
(165, 14, 6), -- // Montego Bay
(165, 20, 7), -- // Hanover
(165, 7, 8);  -- // Negril

-- Insert data for ParentRouteID: 299 (Negril via South - Kingston)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(299, 74, 1), -- NEGS (Negril)
(299, 11, 2), -- SAV (Savanna La Mar)
(299, 4, 3),  -- LUA (Luana)
(299, 2, 4),  -- GUT (Gutters)
(299, 5, 5),  -- MVL (Mandeville)
(299, 17, 6), -- MPN (May Pen)
(299, 3, 7);  -- KGN (Kingston)

-- Insert data for ParentRouteID: 324 (KGN to NEGS)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(324, 3, 1),  -- KGN (Kingston)
(324, 17, 2), -- MPN (May Pen)
(324, 5, 3),  -- MVL (Mandeville)
(324, 2, 4),  -- GUT (Gutters)
(324, 4, 5),  -- LUA (Luana)
(324, 11, 6), -- SAV (Savanna La Mar)
(324, 74, 7); -- NEGS (Negril)

-- Insert data for ParentRouteID: 325 (NEG to POT)
INSERT INTO ParentRouteBranchStops (ParentRouteID, BranchID, StopOrder)
VALUES 
(325, 7, 1),  -- NEG (Negril)
(325, 20, 2), -- LUC (Hanover)
(325, 14, 3), -- MBJ (Montego Bay)
(325, 1, 4),  -- FAL (Falmouth)
(325, 8, 5),  -- OCH (Ocho Rios)
(325, 10, 6), -- STM (Santa Cruz)
(325, 15, 7), -- ANT (Annotto Bay)
(325, 13, 8); -- POT (Port Antonio)
