import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { authService } from '../../src/services/authService.js';
import { db } from '../../src/db/index.js';

describe('authService', () => {
  beforeEach(() => {
    // Clean up tokens before each test
    db.exec('DELETE FROM magic_tokens');
    db.exec('DELETE FROM allowed_clients');
  });

  describe('isClientAllowed', () => {
    it('returns false for unknown email', () => {
      const result = authService.isClientAllowed('unknown@example.com');
      assert.strictEqual(result, false);
    });

    it('returns true for allowed email', () => {
      db.prepare('INSERT INTO allowed_clients (email, name, client_label_id) VALUES (?, ?, ?)').run('client@example.com', 'Test Client', 1);
      const result = authService.isClientAllowed('client@example.com');
      assert.strictEqual(result, true);
    });
  });

  describe('createToken', () => {
    it('creates a token and returns the raw token', () => {
      const token = authService.createToken('client@example.com');
      assert.strictEqual(typeof token, 'string');
      assert.strictEqual(token.length, 64); // 32 bytes hex = 64 chars
    });

    it('stores hashed token in database', () => {
      const token = authService.createToken('client@example.com');
      const row = db.prepare('SELECT * FROM magic_tokens WHERE email = ?').get('client@example.com');
      assert.ok(row);
      assert.notStrictEqual(row.token_hash, token); // Hash, not raw token
    });
  });

  describe('verifyToken', () => {
    it('returns email for valid token', () => {
      const token = authService.createToken('client@example.com');
      const email = authService.verifyToken(token);
      assert.strictEqual(email, 'client@example.com');
    });

    it('returns null for invalid token', () => {
      const email = authService.verifyToken('invalid-token');
      assert.strictEqual(email, null);
    });

    it('returns null for expired token', () => {
      const token = authService.createToken('client@example.com');
      // Manually expire the token
      db.prepare('UPDATE magic_tokens SET expires_at = ? WHERE email = ?').run(0, 'client@example.com');
      const email = authService.verifyToken(token);
      assert.strictEqual(email, null);
    });

    it('deletes token after verification (single-use)', () => {
      const token = authService.createToken('client@example.com');
      authService.verifyToken(token);
      const email = authService.verifyToken(token);
      assert.strictEqual(email, null);
    });
  });
});
