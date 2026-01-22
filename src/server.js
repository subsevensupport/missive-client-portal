import { config } from './config/index.js';
import { runMigrations } from './db/index.js';

// Run database migrations
runMigrations();

console.log(`Starting server on port ${config.port}...`);
console.log('Express app will be implemented in the next task.');
