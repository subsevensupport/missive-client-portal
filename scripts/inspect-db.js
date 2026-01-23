#!/usr/bin/env node
import { db, runMigrations } from '../src/db/index.js';

runMigrations();

console.log('\n=== Client Labels ===');
const labels = db.prepare('SELECT * FROM client_labels ORDER BY code').all();
console.log(`Total: ${labels.length}`);
labels.forEach(label => {
  console.log(`  ${label.code} -> ${label.missive_label_id} (active: ${label.active})`);
});

console.log('\n=== Allowed Clients ===');
const clients = db.prepare(`
  SELECT ac.email, ac.name, cl.code
  FROM allowed_clients ac
  JOIN client_labels cl ON ac.client_label_id = cl.id
  ORDER BY ac.email
`).all();
console.log(`Total: ${clients.length}`);
clients.forEach(client => {
  console.log(`  ${client.email} (${client.name}) -> ${client.code}`);
});

console.log('\n=== Magic Tokens ===');
const tokens = db.prepare('SELECT email, expires_at, created_at FROM magic_tokens ORDER BY created_at DESC LIMIT 10').all();
console.log(`Total: ${db.prepare('SELECT COUNT(*) as count FROM magic_tokens').get().count}`);
tokens.forEach(token => {
  const expired = token.expires_at < Math.floor(Date.now() / 1000);
  console.log(`  ${token.email} - ${expired ? 'EXPIRED' : 'valid'}`);
});
