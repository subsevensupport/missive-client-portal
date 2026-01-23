import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/portal.db');

// Ensure data directory exists
mkdirSync(join(__dirname, '../../data'), { recursive: true });

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Run migrations
export async function runMigrations() {
  // Create migrations table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // Migration 001: Create tables
  const migration001 = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get('001_create_tables');
  const isFirstRun = !migration001;

  if (isFirstRun) {
    db.exec(`
      CREATE TABLE magic_tokens (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE INDEX idx_magic_tokens_hash ON magic_tokens(token_hash);
      CREATE INDEX idx_magic_tokens_email ON magic_tokens(email);

      CREATE TABLE client_labels (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT,
        missive_label_id TEXT UNIQUE NOT NULL,
        active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE INDEX idx_client_labels_code ON client_labels(code);

      CREATE TABLE allowed_clients (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        client_label_id INTEGER NOT NULL REFERENCES client_labels(id),
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE INDEX idx_allowed_clients_email ON allowed_clients(email);
    `);

    db.prepare('INSERT INTO migrations (name) VALUES (?)').run('001_create_tables');
    console.log('Migration 001_create_tables applied');
  }

  // Auto-sync client labels on first run or if table is empty
  const labelCount = db.prepare('SELECT COUNT(*) as count FROM client_labels').get();
  if (labelCount.count === 0) {
    console.log('\nSyncing client labels from Missive API...');
    try {
      const { syncLabelsFromMissive } = await import('../services/labelSyncService.js');
      const stats = await syncLabelsFromMissive({ verbose: false });
      console.log(`✓ Synced ${stats.total} client labels from Missive\n`);
    } catch (error) {
      console.error('✗ Failed to auto-sync labels:', error.message);
      console.error('Please run manually: npm run sync-labels\n');
    }
  }
}
