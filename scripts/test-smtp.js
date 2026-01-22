#!/usr/bin/env node
import { emailService } from '../src/services/emailService.js';
import { config } from '../src/config/index.js';

console.log('Testing SMTP connection...');

try {
  await emailService.verifyConnection();
  console.log('✓ SMTP connection successful!');

  console.log('\nTesting email send...');
  const testEmail = config.email.testTo;
  await emailService.sendMagicLink(testEmail, 'test-token-123');
  console.log('✓ Test email sent successfully!');
  console.log(`  Check ${testEmail} inbox`);
} catch (error) {
  console.error('✗ SMTP test failed:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
