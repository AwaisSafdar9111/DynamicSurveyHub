// SQL Server Connection Utility
// This script demonstrates how to connect to SQL Server from Node.js

// Add this to your package.json dependencies: "mssql": "^9.1.1"
// Run: npm install mssql

const sql = require('mssql');

// Configuration for SQL Server connection
const config = {
  server: 'your-sql-server', // Update with your server name or IP
  database: 'DynamicSurvey', // Update with your database name
  user: 'your-username',     // Update with your username
  password: 'your-password', // Update with your password
  options: {
    encrypt: true,           // For Azure SQL Server
    trustServerCertificate: true, // For development environments
    enableArithAbort: true   // Recommended setting
  }
};

async function connectToSqlServer() {
  try {
    // Connect to the SQL Server
    console.log('Connecting to SQL Server...');
    await sql.connect(config);
    
    // Execute a test query
    console.log('Executing test query...');
    const result = await sql.query`SELECT TOP 10 * FROM users`;
    
    // Display the results
    console.log('Query results:');
    console.table(result.recordset);
    
    // Close the connection
    await sql.close();
    console.log('Connection closed successfully.');
    
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
    // Close the connection on error
    if (sql.connected) {
      await sql.close();
    }
  }
}

// Run the function
connectToSqlServer();

/*
 * Usage:
 * 1. Update the connection configuration above
 * 2. Run: node sqlserver-connect.js
 *
 * Example of executing custom queries:
 *
 * async function executeCustomQuery() {
 *   try {
 *     await sql.connect(config);
 *     
 *     // Parameterized query example
 *     const userId = 1;
 *     const result = await sql.query`
 *       SELECT f.title, f.description, COUNT(s.id) as submission_count
 *       FROM forms f
 *       LEFT JOIN submissions s ON s.form_id = f.id
 *       WHERE f.created_by = (SELECT username FROM users WHERE id = ${userId})
 *       GROUP BY f.id, f.title, f.description
 *     `;
 *     
 *     console.table(result.recordset);
 *     await sql.close();
 *   } catch (err) {
 *     console.error('Error:', err);
 *     if (sql.connected) await sql.close();
 *   }
 * }
 */