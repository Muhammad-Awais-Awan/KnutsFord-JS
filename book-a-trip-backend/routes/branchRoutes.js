// routes/branchRoutes.js
const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../config/dataBaseConnection");

// Get all branches
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Branches"); // Adjust table name as necessary
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
