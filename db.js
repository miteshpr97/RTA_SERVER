const sql = require('mssql');

const dbConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool;

async function connectToDatabase() {
  try {
    pool = await sql.connect(dbConfig); // Store the connection pool
    console.log("Connected to MSSQL server");
  } catch (err) {
    throw err;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool; 
}

module.exports = {
  sql,
  connectToDatabase,
  getPool,
};
