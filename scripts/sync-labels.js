#!/usr/bin/env node
import { syncLabelsFromMissive } from '../src/services/labelSyncService.js';

console.log('Syncing client labels from Missive API...\n');

try {
  await syncLabelsFromMissive({ verbose: true });
} catch (error) {
  console.error('\n✗ Sync failed:', error.message);
  console.error(error);
  process.exit(1);
}
