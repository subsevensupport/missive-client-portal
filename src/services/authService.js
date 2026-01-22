import { randomBytes, createHash } from 'crypto';
import { db } from '../db/index.js';
import { config } from '../config/index.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export const authService = {
  isClientAllowed(email) {
    const row = db.prepare('SELECT 1 FROM allowed_clients WHERE email = ?').get(email.toLowerCase());
    return !!row;
  },

  createToken(email) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = Math.floor(Date.now() / 1000) + (config.auth.tokenExpiryMinutes * 60);

    db.prepare(`
      INSERT INTO magic_tokens (email, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(email.toLowerCase(), tokenHash, expiresAt);

    return token;
  },

  verifyToken(token) {
    const tokenHash = hashToken(token);
    const now = Math.floor(Date.now() / 1000);

    const row = db.prepare(`
      SELECT email FROM magic_tokens
      WHERE token_hash = ? AND expires_at > ?
    `).get(tokenHash, now);

    if (!row) {
      return null;
    }

    // Delete token (single-use)
    db.prepare('DELETE FROM magic_tokens WHERE token_hash = ?').run(tokenHash);

    return row.email;
  },

  cleanupExpiredTokens() {
    const now = Math.floor(Date.now() / 1000);
    db.prepare('DELETE FROM magic_tokens WHERE expires_at <= ?').run(now);
  },

  addAllowedClient(email, name, clientLabelId) {
    db.prepare(`
      INSERT OR IGNORE INTO allowed_clients (email, name, client_label_id)
      VALUES (?, ?, ?)
    `).run(email.toLowerCase(), name, clientLabelId);
  },

  getClientCode(email) {
    const row = db.prepare(`
      SELECT cl.code
      FROM allowed_clients ac
      JOIN client_labels cl ON ac.client_label_id = cl.id
      WHERE ac.email = ? AND cl.active = 1
    `).get(email.toLowerCase());
    return row?.code || null;
  },

  getClientLabel(email) {
    return db.prepare(`
      SELECT cl.*
      FROM allowed_clients ac
      JOIN client_labels cl ON ac.client_label_id = cl.id
      WHERE ac.email = ? AND cl.active = 1
    `).get(email.toLowerCase());
  },

  removeAllowedClient(email) {
    db.prepare('DELETE FROM allowed_clients WHERE email = ?').run(email.toLowerCase());
  },
};
