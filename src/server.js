import { config } from './config/index.js';
import { runMigrations } from './db/index.js';
import { app } from './app.js';

// Run database migrations and start server
await runMigrations();

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
