#!/usr/bin/env node
import { db } from '../src/db/index.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Re-seeding client labels from CSV...\n');

// Clear existing labels
const existingCount = db.prepare('SELECT COUNT(*) as count FROM client_labels').get().count;
console.log(`Existing labels in database: ${existingCount}`);

if (existingCount > 0) {
  console.log('Clearing existing labels...');
  db.prepare('DELETE FROM client_labels').run();
  console.log('✓ Cleared\n');
}

// Read CSV
const csvPath = join(__dirname, '../client-labels.csv');
const content = readFileSync(csvPath, 'utf-8');
const lines = content.trim().split('\n').slice(1); // Skip header

console.log(`Found ${lines.length} lines in CSV (including "Clients" parent)\n`);

// Prepare insert statement
const insert = db.prepare(`
  INSERT INTO client_labels (code, missive_label_id)
  VALUES (?, ?)
`);

let inserted = 0;
let skipped = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  console.log(`\nLine ${i + 1}: "${line}"`);

  const [uuid, label] = line.split(',');
  console.log(`  UUID: "${uuid}"`);
  console.log(`  Label: "${label}"`);

  // Only insert "Clients/CODE" format, skip "Clients" parent
  const match = label ? label.match(/^Clients\/(.+)$/) : null;

  if (match) {
    const code = match[1];
    try {
      insert.run(code, uuid);
      console.log(`  ✓ Inserted: ${code} -> ${uuid}`);
      inserted++;
    } catch (error) {
      console.error(`  ✗ Failed to insert ${code}:`, error.message);
    }
  } else {
    console.log(`  - Skipped (${label ? 'not in Clients/CODE format' : 'no label found'})`);
    skipped++;
  }
}

console.log(`\nSummary:`);
console.log(`  Inserted: ${inserted}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Total in database: ${db.prepare('SELECT COUNT(*) as count FROM client_labels').get().count}`);
