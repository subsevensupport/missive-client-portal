#!/usr/bin/env node
import { emailService } from '../src/services/emailService.js';

console.log('Testing SMTP connection...');

try {
  await emailService.verifyConnection();
  console.log('✓ SMTP connection successful!');

  console.log('\nTesting email send...');
  await emailService.sendMagicLink('test@example.com', 'test-token-123');
  console.log('✓ Test email sent successfully!');
  console.log('  Check test@example.com inbox');
} catch (error) {
  console.error('✗ SMTP test failed:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
