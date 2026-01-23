#!/usr/bin/env node
import { db } from '../src/db/index.js';
import { config } from '../src/config/index.js';

console.log('Syncing client labels from Missive API...\n');

async function fetchAllSharedLabels() {
  const allLabels = [];
  let offset = 0;
  const limit = 200; // Max allowed by API

  while (true) {
    const url = `${config.missive.baseUrl}/shared_labels?limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.missive.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Missive API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    allLabels.push(...data.shared_labels);

    console.log(`Fetched ${data.shared_labels.length} labels (offset: ${offset})`);

    // If we got fewer than the limit, we've reached the end
    if (data.shared_labels.length < limit) {
      break;
    }

    offset += limit;
  }

  return allLabels;
}

try {
  // Fetch all labels from API
  console.log('Fetching labels from Missive API...');
  const allLabels = await fetchAllSharedLabels();
  console.log(`Total labels fetched: ${allLabels.length}\n`);

  // Filter to only "Clients/*" labels
  const clientLabels = allLabels.filter(label =>
    label.name_with_parent_names.startsWith('Clients/')
  );

  console.log(`Client labels found: ${clientLabels.length}\n`);

  // Show what we're about to sync
  console.log('Client labels to sync:');
  clientLabels.forEach(label => {
    const code = label.name_with_parent_names.replace('Clients/', '');
    console.log(`  ${code} -> ${label.id}`);
  });

  console.log('\nSyncing to database...');

  // Start transaction
  db.exec('BEGIN TRANSACTION');

  try {
    // Get existing labels
    const existing = db.prepare('SELECT code, missive_label_id FROM client_labels').all();
    const existingMap = new Map(existing.map(l => [l.code, l.missive_label_id]));

    const insertStmt = db.prepare(`
      INSERT INTO client_labels (code, name, missive_label_id)
      VALUES (?, ?, ?)
    `);

    const updateStmt = db.prepare(`
      UPDATE client_labels
      SET name = ?, missive_label_id = ?
      WHERE code = ?
    `);

    const deactivateStmt = db.prepare(`
      UPDATE client_labels
      SET active = 0
      WHERE code = ?
    `);

    const reactivateStmt = db.prepare(`
      UPDATE client_labels
      SET active = 1, name = ?, missive_label_id = ?
      WHERE code = ?
    `);

    let inserted = 0;
    let updated = 0;
    let reactivated = 0;
    const processedCodes = new Set();

    // Process each client label from API
    for (const label of clientLabels) {
      const code = label.name_with_parent_names.replace('Clients/', '');
      const name = label.name; // Just the label name without parent
      const uuid = label.id;

      processedCodes.add(code);

      if (existingMap.has(code)) {
        // Check if it needs updating
        if (existingMap.get(code) !== uuid) {
          updateStmt.run(name, uuid, code);
          console.log(`  ✓ Updated: ${code}`);
          updated++;
        }
        // Ensure it's active
        const existing = db.prepare('SELECT active FROM client_labels WHERE code = ?').get(code);
        if (existing.active === 0) {
          reactivateStmt.run(name, uuid, code);
          console.log(`  ✓ Reactivated: ${code}`);
          reactivated++;
        }
      } else {
        // New label
        insertStmt.run(code, name, uuid);
        console.log(`  ✓ Inserted: ${code}`);
        inserted++;
      }
    }

    // Deactivate labels that are no longer in Missive
    let deactivated = 0;
    for (const [code, _] of existingMap) {
      if (!processedCodes.has(code)) {
        deactivateStmt.run(code);
        console.log(`  ⊘ Deactivated: ${code} (no longer in Missive)`);
        deactivated++;
      }
    }

    db.exec('COMMIT');

    console.log('\n=== Summary ===');
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Reactivated: ${reactivated}`);
    console.log(`  Deactivated: ${deactivated}`);
    console.log(`  Total active in database: ${db.prepare('SELECT COUNT(*) as count FROM client_labels WHERE active = 1').get().count}`);

  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

} catch (error) {
  console.error('\n✗ Sync failed:', error.message);
  console.error(error);
  process.exit(1);
}
