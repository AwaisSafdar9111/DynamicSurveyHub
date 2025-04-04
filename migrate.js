const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a minimal drizzle.config.json file
const config = {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};

// Write the config file
fs.writeFileSync(
  path.join(__dirname, 'drizzle.config.json'), 
  JSON.stringify(config, null, 2)
);

console.log('Created drizzle.config.json');

// Run the migration
const migration = spawn('npx', ['drizzle-kit', 'push:pg']);

migration.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

migration.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

migration.on('close', (code) => {
  console.log(`Migration process exited with code ${code}`);
  
  // Clean up the config file
  fs.unlinkSync(path.join(__dirname, 'drizzle.config.json'));
  console.log('Removed drizzle.config.json');
});