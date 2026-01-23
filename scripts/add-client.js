#!/usr/bin/env node
import { authService } from '../src/services/authService.js';
import { runMigrations } from '../src/db/index.js';
import { clientLabelsService } from '../src/services/clientLabelsService.js';

await runMigrations();

const [email, name, clientCode] = process.argv.slice(2);

if (!email || !clientCode) {
  console.log('Usage: node scripts/add-client.js <email> <name> <client_code>');
  console.log('\nAvailable client codes:');
  clientLabelsService.getAllCodes().forEach(code => console.log(`  ${code}`));
  process.exit(1);
}

// Verify client code exists and get its ID
const label = clientLabelsService.getLabelByCode(clientCode);
if (!label) {
  console.error(`Error: Unknown client code "${clientCode}"`);
  console.log('\nAvailable client codes:');
  clientLabelsService.getAllCodes().forEach(code => console.log(`  ${code}`));
  process.exit(1);
}

authService.addAllowedClient(email, name, label.id);
console.log(`Added client: ${email} (${name}) -> ${clientCode}`);
