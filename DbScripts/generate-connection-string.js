/**
 * SQL Server Connection String Generator
 * This utility helps generate properly formatted connection strings for SQL Server
 * 
 * Usage: node generate-connection-string.js
 */

const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to generate connection string
function generateConnectionString(config) {
  // Basic connection string
  let connectionString = `Server=${config.server};Database=${config.database};`;
  
  // Authentication
  if (config.useWindowsAuth) {
    connectionString += 'Trusted_Connection=True;';
  } else {
    connectionString += `User Id=${config.username};Password=${config.password};`;
  }
  
  // Additional options
  if (config.encrypt) {
    connectionString += 'Encrypt=True;';
  }
  
  if (config.trustServerCertificate) {
    connectionString += 'TrustServerCertificate=True;';
  }
  
  if (config.multipleActiveResultSets) {
    connectionString += 'MultipleActiveResultSets=True;';
  }
  
  if (config.timeout) {
    connectionString += `Connection Timeout=${config.timeout};`;
  }
  
  return connectionString;
}

// Function to generate NodeJS connection config
function generateNodeConfig(config) {
  return `{
  server: '${config.server}',
  database: '${config.database}',
  ${config.useWindowsAuth ? 
    'authentication: { type: "default" },' : 
    `user: '${config.username}',\n  password: '${config.password}',`
  }
  options: {
    encrypt: ${config.encrypt},
    trustServerCertificate: ${config.trustServerCertificate},
    ${config.multipleActiveResultSets ? 'enableArithAbort: true,' : ''}
    ${config.timeout ? `connectionTimeout: ${config.timeout}` : ''}
  }
}`;
}

// Main function to collect information and generate connection strings
async function main() {
  console.log('SQL Server Connection String Generator');
  console.log('======================================');
  
  const config = {};
  
  // Collect information
  config.server = await question('Enter server address (e.g., localhost\\SQLEXPRESS or server.database.windows.net): ');
  config.database = await question('Enter database name: ');
  
  const authType = await question('Use Windows Authentication? (y/n): ');
  config.useWindowsAuth = authType.toLowerCase() === 'y';
  
  if (!config.useWindowsAuth) {
    config.username = await question('Enter username: ');
    config.password = await question('Enter password: ');
  }
  
  const encrypt = await question('Encrypt connection? (y/n): ');
  config.encrypt = encrypt.toLowerCase() === 'y';
  
  const trustCert = await question('Trust server certificate? (recommended for dev environments) (y/n): ');
  config.trustServerCertificate = trustCert.toLowerCase() === 'y';
  
  const mars = await question('Enable Multiple Active Result Sets (MARS)? (y/n): ');
  config.multipleActiveResultSets = mars.toLowerCase() === 'y';
  
  const timeout = await question('Connection timeout in seconds (leave empty for default): ');
  config.timeout = timeout ? parseInt(timeout) : null;
  
  // Generate connection strings
  console.log('\nGenerated Connection Strings:');
  console.log('---------------------------');
  
  console.log('\nADO.NET Connection String:');
  console.log(generateConnectionString(config));
  
  console.log('\nNode.js mssql Package Configuration:');
  console.log(generateNodeConfig(config));
  
  console.log('\nConnection string for .NET appsettings.json:');
  console.log(`"ConnectionStrings": { "DefaultConnection": "${generateConnectionString(config)}" }`);
  
  rl.close();
}

// Helper function to prompt user
function question(query) {
  return new Promise(resolve => {
    rl.question(`${query} `, answer => {
      resolve(answer.trim());
    });
  });
}

// Run the main function
main().catch(err => {
  console.error('An error occurred:', err);
  rl.close();
});