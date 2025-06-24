const { getPool } = require("../db"); 

// Helper function to get a new SQL request instance from the pool
const getSqlRequest = () => {
  const pool = getPool(); // Get the connection pool
  return pool.request(); // New SQL request instance from the pool
};

module.exports = getSqlRequest;