// config/database.js
const sql = require("mssql");

const config = {
  user: "BusSystem",
  password: "BusSystem",
  database: "KnutFord_Database_Dev",
  server: "VmExternalDev",
  options: {
    trustServerCertificate: true, // For local development, you might need this if you're connecting locally
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.error("Database connection failed:", err));

module.exports = {
  sql,
  poolPromise,
};
