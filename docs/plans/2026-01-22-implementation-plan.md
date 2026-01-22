# Client Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready, read-only client portal for viewing Missive support threads with magic link authentication.

**Architecture:** Layered Express app (routes → controllers → services) with EJS templates, SQLite for auth tokens, in-memory caching for Missive API responses, and htmx for interactive UI.

**Tech Stack:** Node.js, Express 5, EJS, better-sqlite3, nodemailer, node-cache, htmx

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `src/server.js`
- Create: `.env.example`
- Create: `.gitignore`

**Step 1: Initialize package.json**

```bash
rm -rf node_modules package.json package-lock.json
npm init -y
```

**Step 2: Update package.json with correct metadata and scripts**

Edit `package.json` to contain:

```json
{
  "name": "missive-client-portal",
  "version": "1.0.0",
  "description": "A client portal for viewing Missive support threads",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.js",
    "start": "node --env-file=.env src/server.js",
    "test": "node --test"
  },
  "author": "Ray",
  "license": "GPL-3.0-or-later"
}
```

**Step 3: Install dependencies**

```bash
npm install express@5 ejs better-sqlite3 express-session express-rate-limit nodemailer node-cache
```

**Step 4: Create .env.example**

```env
# Server
PORT=3000
SESSION_SECRET=your-session-secret-at-least-32-chars

# Missive API
MISSIVE_API_TOKEN=your-missive-api-token

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com

# App
APP_URL=http://localhost:3000
CLIENT_MARKER=[CLIENT]
```

**Step 5: Create .gitignore**

```gitignore
node_modules/
.env
*.db
*.sqlite
.DS_Store
```

**Step 6: Create minimal server entry point**

Create `src/server.js`:

```javascript
const PORT = process.env.PORT || 3000;

console.log(`Starting server on port ${PORT}...`);
console.log('Server setup will be implemented in the next task.');
```

**Step 7: Verify setup**

```bash
node src/server.js
```

Expected: "Starting server on port 3000..."

**Step 8: Commit**

```bash
git add -A
git commit -m "chore: initialize project with dependencies and structure"
```

---

## Task 2: Configuration Module

**Files:**
- Create: `src/config/index.js`

**Step 1: Create config module**

Create `src/config/index.js`:

```javascript
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, defaultValue) {
  return process.env[name] || defaultValue;
}

export const config = {
  port: optionalEnv('PORT', '3000'),
  sessionSecret: requireEnv('SESSION_SECRET'),

  missive: {
    apiToken: requireEnv('MISSIVE_API_TOKEN'),
    baseUrl: 'https://public.missiveapp.com/v1',
  },

  smtp: {
    host: requireEnv('SMTP_HOST'),
    port: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
    user: requireEnv('SMTP_USER'),
    pass: requireEnv('SMTP_PASS'),
  },

  email: {
    from: requireEnv('EMAIL_FROM'),
  },

  app: {
    url: requireEnv('APP_URL'),
    clientMarker: optionalEnv('CLIENT_MARKER', '[CLIENT]'),
  },

  auth: {
    tokenExpiryMinutes: 15,
    sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  cache: {
    ttlSeconds: 300, // 5 minutes
  },
};
```

**Step 2: Update server.js to use config**

Update `src/server.js`:

```javascript
import { config } from './config/index.js';

console.log(`Starting server on port ${config.port}...`);
console.log('Express app will be implemented in the next task.');
```

**Step 3: Create .env for local development**

Copy `.env.example` to `.env` and fill in real values (user does this manually).

**Step 4: Verify config loads**

```bash
node --env-file=.env src/server.js
```

Expected: "Starting server on port 3000..."

**Step 5: Commit**

```bash
git add src/config/index.js
git commit -m "feat: add configuration module with environment validation"
```

---

## Task 3: Database Setup (SQLite)

**Files:**
- Create: `src/db/index.js`
- Create: `src/db/migrations/001_create_tables.js`

**Step 1: Create database connection module**

Create `src/db/index.js`:

```javascript
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/portal.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(join(__dirname, '../../data'), { recursive: true });

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Run migrations
export function runMigrations() {
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
  if (!migration001) {
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

      CREATE TABLE allowed_clients (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        client_code TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE INDEX idx_allowed_clients_email ON allowed_clients(email);
      CREATE INDEX idx_allowed_clients_code ON allowed_clients(client_code);
    `);

    db.prepare('INSERT INTO migrations (name) VALUES (?)').run('001_create_tables');
    console.log('Migration 001_create_tables applied');
  }
}
```

**Step 2: Update server.js to run migrations on startup**

Update `src/server.js`:

```javascript
import { config } from './config/index.js';
import { runMigrations } from './db/index.js';

// Run database migrations
runMigrations();

console.log(`Starting server on port ${config.port}...`);
console.log('Express app will be implemented in the next task.');
```

**Step 3: Verify database creates**

```bash
node --env-file=.env src/server.js
```

Expected: "Migration 001_create_tables applied" and "Starting server on port 3000..."

**Step 4: Add data/ to .gitignore**

Append to `.gitignore`:

```
data/
```

**Step 5: Commit**

```bash
git add src/db/ .gitignore
git commit -m "feat: add SQLite database with migrations for auth tables"
```

---

## Task 4: Auth Service (Magic Link Tokens)

**Files:**
- Create: `src/services/authService.js`
- Create: `tests/services/authService.test.js`

**Step 1: Write the failing test**

Create `tests/services/authService.test.js`:

```javascript
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
      db.prepare('INSERT INTO allowed_clients (email, name) VALUES (?, ?)').run('client@example.com', 'Test Client');
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
```

**Step 2: Run test to verify it fails**

```bash
node --env-file=.env --test tests/services/authService.test.js
```

Expected: FAIL (module not found)

**Step 3: Implement authService**

Create `src/services/authService.js`:

```javascript
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

  addAllowedClient(email, name, clientCode) {
    db.prepare(`
      INSERT OR IGNORE INTO allowed_clients (email, name, client_code)
      VALUES (?, ?, ?)
    `).run(email.toLowerCase(), name, clientCode);
  },

  getClientCode(email) {
    const row = db.prepare('SELECT client_code FROM allowed_clients WHERE email = ?').get(email.toLowerCase());
    return row?.client_code || null;
  },

  removeAllowedClient(email) {
    db.prepare('DELETE FROM allowed_clients WHERE email = ?').run(email.toLowerCase());
  },
};
```

**Step 4: Run tests to verify they pass**

```bash
node --env-file=.env --test tests/services/authService.test.js
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add src/services/authService.js tests/
git commit -m "feat: add authService with magic link token creation and verification"
```

---

## Task 5: Email Service

**Files:**
- Create: `src/services/emailService.js`

**Step 1: Create email service**

Create `src/services/emailService.js`:

```javascript
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const emailService = {
  async sendMagicLink(email, token) {
    const loginUrl = `${config.app.url}/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Your login link for the Client Portal',
      text: `Click this link to log in to your client portal:\n\n${loginUrl}\n\nThis link expires in ${config.auth.tokenExpiryMinutes} minutes.\n\nIf you didn't request this link, you can safely ignore this email.`,
      html: `
        <p>Click the button below to log in to your client portal:</p>
        <p style="margin: 24px 0;">
          <a href="${loginUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Log in to Portal
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in ${config.auth.tokenExpiryMinutes} minutes.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      `,
    });
  },

  async verifyConnection() {
    await transporter.verify();
  },
};
```

**Step 2: Commit**

```bash
git add src/services/emailService.js
git commit -m "feat: add emailService for sending magic link emails"
```

---

## Task 6: Client Labels Loader

**Files:**
- Create: `src/services/clientLabels.js`

**Step 1: Create client labels loader**

This module loads the client-labels.csv at startup and provides a lookup from client code to Missive shared label UUID.

Create `src/services/clientLabels.js`:

```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, '../../client-labels.csv');

// Map of client code -> label UUID
const clientLabels = new Map();

// Map of label UUID -> client code (reverse lookup)
const labelToCode = new Map();

function loadClientLabels() {
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1); // Skip header

  for (const line of lines) {
    const [uuid, label] = line.split(',');
    // Label format is "Clients/CODE" - extract the code
    const match = label.match(/^Clients\/(.+)$/);
    if (match) {
      const code = match[1];
      clientLabels.set(code, uuid);
      labelToCode.set(uuid, code);
    }
  }

  console.log(`Loaded ${clientLabels.size} client labels`);
}

// Load on module import
loadClientLabels();

export function getLabelUUID(clientCode) {
  return clientLabels.get(clientCode);
}

export function getClientCode(labelUUID) {
  return labelToCode.get(labelUUID);
}

export function getAllClientCodes() {
  return Array.from(clientLabels.keys()).sort();
}
```

**Step 2: Commit**

```bash
git add src/services/clientLabels.js
git commit -m "feat: add client labels loader from CSV"
```

---

## Task 7: Missive Service (API Client + Caching)

**Files:**
- Create: `src/services/missiveService.js`

**Step 1: Create Missive service**

Create `src/services/missiveService.js`:

```javascript
import NodeCache from 'node-cache';
import { config } from '../config/index.js';
import { getLabelUUID } from './clientLabels.js';

const cache = new NodeCache({ stdTTL: config.cache.ttlSeconds });

async function missiveRequest(endpoint, params = {}) {
  const url = new URL(`${config.missive.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.missive.apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Missive API error: ${response.status} ${text}`);
  }

  return response.json();
}

function extractClientVisibleMessages(messages) {
  const marker = config.app.clientMarker;

  return messages
    .filter(msg => {
      const preview = msg.preview || '';
      const body = msg.body?.plain || msg.body?.html || '';
      return preview.includes(marker) || body.includes(marker);
    })
    .map(msg => ({
      id: msg.id,
      subject: msg.subject,
      preview: (msg.preview || '').replace(marker, '').trim(),
      deliveredAt: msg.delivered_at,
      from: msg.from_field,
    }));
}

export const missiveService = {
  async getConversationsForClient(clientCode, options = {}) {
    const labelUUID = getLabelUUID(clientCode);
    if (!labelUUID) {
      throw new Error(`Unknown client code: ${clientCode}`);
    }

    const cacheKey = `conversations:${clientCode}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch conversations by shared label
    const params = {
      shared_label: labelUUID,
      limit: 50,
    };

    const data = await missiveRequest('/conversations', params);

    // Transform to simpler format
    const result = (data.conversations || []).map(conv => ({
      id: conv.id,
      subject: conv.latest_message_subject || conv.subject || '(No subject)',
      lastActivityAt: conv.last_activity_at,
      messagesCount: conv.messages_count,
      closed: conv.users?.[0]?.closed || false,
      authors: conv.authors,
    }));

    cache.set(cacheKey, result);
    return result;
  },

  async getConversation(conversationId) {
    const cacheKey = `conversation:${conversationId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await missiveRequest(`/conversations/${conversationId}`);
    const conv = data.conversations?.[0];

    if (!conv) {
      return null;
    }

    const result = {
      id: conv.id,
      subject: conv.latest_message_subject || conv.subject || '(No subject)',
      lastActivityAt: conv.last_activity_at,
      closed: conv.users?.[0]?.closed || false,
      authors: conv.authors,
    };

    cache.set(cacheKey, result);
    return result;
  },

  async getConversationMessages(conversationId, clientEmail) {
    const cacheKey = `messages:${conversationId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all messages (paginate if needed)
    let allMessages = [];
    let until = undefined;

    do {
      const params = { limit: 10 };
      if (until) params.until = until;

      const data = await missiveRequest(`/conversations/${conversationId}/messages`, params);
      const messages = data.messages || [];

      if (messages.length === 0) break;

      allMessages = allMessages.concat(messages);

      // Check if we got less than limit (last page)
      if (messages.length < 10) break;

      // Get oldest message timestamp for pagination
      until = messages[messages.length - 1].delivered_at;
    } while (true);

    // Filter to client-visible messages
    const result = extractClientVisibleMessages(allMessages);

    // Sort oldest to newest for display
    result.sort((a, b) => a.deliveredAt - b.deliveredAt);

    cache.set(cacheKey, result);
    return result;
  },

  clearCache() {
    cache.flushAll();
  },

  async verifyConnection() {
    // Make a simple request to verify API token works
    await missiveRequest('/conversations', { team_all: config.missive.teamId, limit: 1 });
  },
};
```

**Step 2: Commit**

```bash
git add src/services/missiveService.js
git commit -m "feat: add missiveService with API client and caching"
```

---

## Task 7: Express App Setup

**Files:**
- Create: `src/app.js`
- Create: `src/middleware/requireAuth.js`
- Update: `src/server.js`

**Step 1: Create requireAuth middleware**

Create `src/middleware/requireAuth.js`:

```javascript
export function requireAuth(req, res, next) {
  if (!req.session?.clientEmail) {
    return res.redirect('/login');
  }
  next();
}
```

**Step 2: Create Express app**

Create `src/app.js`:

```javascript
import express from 'express';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));

// Static files
app.use(express.static(join(__dirname, '../public')));

// Body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: config.auth.sessionMaxAgeMs,
  },
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later.',
});

// Make session data available to views
app.use((req, res, next) => {
  res.locals.clientEmail = req.session?.clientEmail || null;
  next();
});

// Routes will be added here
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export limiter for use in routes
export { authLimiter };
```

**Step 3: Update server.js**

Update `src/server.js`:

```javascript
import { config } from './config/index.js';
import { runMigrations } from './db/index.js';
import { app } from './app.js';

// Run database migrations
runMigrations();

// Start server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
```

**Step 4: Create directories and placeholder files**

```bash
mkdir -p views/layouts views/pages views/partials public
```

**Step 5: Create base layout**

Create `views/layouts/main.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title : 'Client Portal' %></title>
  <link rel="stylesheet" href="/styles.css">
  <script src="https://unpkg.com/htmx.org@2.0.4"></script>
</head>
<body>
  <% if (clientEmail) { %>
  <header>
    <div class="header-content">
      <h1>Client Portal</h1>
      <div class="header-right">
        <span><%= clientEmail %></span>
        <form action="/logout" method="POST" style="display: inline;">
          <button type="submit" class="btn-link">Logout</button>
        </form>
      </div>
    </div>
  </header>
  <% } %>

  <main>
    <%- body %>
  </main>
</body>
</html>
```

**Step 6: Create basic stylesheet**

Create `public/styles.css`:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

header {
  background: #fff;
  border-bottom: 1px solid #ddd;
  padding: 1rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.25rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
}

.btn:hover {
  background: #0052a3;
}

.btn-link {
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

input[type="email"],
input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input[type="email"]:focus,
input[type="text"]:focus {
  outline: none;
  border-color: #0066cc;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.error {
  color: #cc0000;
  background: #ffeeee;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success {
  color: #006600;
  background: #eeffee;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
```

**Step 7: Verify server starts**

```bash
node --env-file=.env src/server.js
```

Expected: "Server running at http://localhost:3000"

**Step 8: Commit**

```bash
git add src/app.js src/middleware/ src/server.js views/ public/
git commit -m "feat: add Express app with session, views, and static files"
```

---

## Task 8: Auth Routes and Controllers

**Files:**
- Create: `src/routes/auth.js`
- Create: `src/controllers/authController.js`
- Create: `views/pages/login.ejs`
- Create: `views/pages/check-email.ejs`
- Update: `src/app.js`

**Step 1: Create auth controller**

Create `src/controllers/authController.js`:

```javascript
import { authService } from '../services/authService.js';
import { emailService } from '../services/emailService.js';

export const authController = {
  showLogin(req, res) {
    if (req.session?.clientEmail) {
      return res.redirect('/');
    }
    res.render('pages/login', {
      title: 'Login',
      error: req.query.error,
    });
  },

  async requestMagicLink(req, res) {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.render('pages/login', {
        title: 'Login',
        error: 'Please enter a valid email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if client is allowed
    if (!authService.isClientAllowed(normalizedEmail)) {
      // Don't reveal whether email exists - always show success
      return res.render('pages/check-email', {
        title: 'Check Your Email',
        email: normalizedEmail,
      });
    }

    try {
      const token = authService.createToken(normalizedEmail);
      await emailService.sendMagicLink(normalizedEmail, token);
    } catch (error) {
      console.error('Failed to send magic link:', error);
      // Still show success to prevent email enumeration
    }

    res.render('pages/check-email', {
      title: 'Check Your Email',
      email: normalizedEmail,
    });
  },

  verifyToken(req, res) {
    const { token } = req.query;

    if (!token) {
      return res.redirect('/login?error=Invalid+link');
    }

    const email = authService.verifyToken(token);

    if (!email) {
      return res.redirect('/login?error=Link+expired+or+invalid');
    }

    // Create session
    req.session.clientEmail = email;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/login?error=Login+failed');
      }
      res.redirect('/');
    });
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/login');
    });
  },
};
```

**Step 2: Create auth routes**

Create `src/routes/auth.js`:

```javascript
import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authLimiter } from '../app.js';

export const authRouter = Router();

authRouter.get('/login', authController.showLogin);
authRouter.post('/auth/request-link', authLimiter, authController.requestMagicLink);
authRouter.get('/auth/verify', authController.verifyToken);
authRouter.post('/logout', authController.logout);
```

**Step 3: Create login page**

Create `views/pages/login.ejs`:

```html
<%- include('../layouts/main', { body: `
  <div class="login-container">
    <div class="login-card">
      <h2>Client Portal</h2>
      <p>Enter your email to receive a login link.</p>

      ${typeof error !== 'undefined' && error ? `<div class="error">${error}</div>` : ''}

      <form action="/auth/request-link" method="POST">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required autofocus placeholder="you@company.com">
        </div>
        <button type="submit" class="btn">Send Login Link</button>
      </form>
    </div>
  </div>
` }) %>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  margin-bottom: 0.5rem;
}

.login-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.login-card .btn {
  width: 100%;
}
</style>
```

**Step 4: Create check-email page**

Create `views/pages/check-email.ejs`:

```html
<%- include('../layouts/main', { body: `
  <div class="login-container">
    <div class="login-card">
      <h2>Check Your Email</h2>
      <p>We sent a login link to <strong>${email}</strong>.</p>
      <p>Click the link in the email to log in. The link expires in 15 minutes.</p>
      <p style="margin-top: 1.5rem;"><a href="/login">← Back to login</a></p>
    </div>
  </div>
` }) %>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  margin-bottom: 1rem;
}

.login-card p {
  color: #666;
  margin-bottom: 0.5rem;
}
</style>
```

**Step 5: Update app.js to use auth routes**

Add to `src/app.js` before the health endpoint:

```javascript
import { authRouter } from './routes/auth.js';

// ... existing code ...

// Routes
app.use(authRouter);
```

**Step 6: Verify login page loads**

```bash
node --env-file=.env src/server.js
```

Visit http://localhost:3000/login - should show login form.

**Step 7: Commit**

```bash
git add src/routes/auth.js src/controllers/authController.js views/pages/login.ejs views/pages/check-email.ejs src/app.js
git commit -m "feat: add auth routes with magic link flow"
```

---

## Task 9: Thread Routes and Controllers

**Files:**
- Create: `src/routes/threads.js`
- Create: `src/controllers/threadController.js`
- Create: `views/pages/dashboard.ejs`
- Create: `views/partials/thread-list.ejs`
- Create: `views/partials/reading-pane.ejs`
- Update: `src/app.js`

**Step 1: Create thread controller**

Create `src/controllers/threadController.js`:

```javascript
import { missiveService } from '../services/missiveService.js';
import { authService } from '../services/authService.js';

export const threadController = {
  async showDashboard(req, res) {
    const clientEmail = req.session.clientEmail;
    const clientCode = authService.getClientCode(clientEmail);
    const selectedThreadId = req.query.thread;
    const filter = req.query.filter || 'all';
    const search = req.query.search || '';

    if (!clientCode) {
      return res.render('pages/dashboard', {
        title: 'Dashboard',
        threads: [],
        selectedThread: null,
        messages: [],
        selectedThreadId: null,
        filter,
        search,
        error: 'Client configuration error. Please contact support.',
      });
    }

    try {
      let threads = await missiveService.getConversationsForClient(clientCode);

      // Apply filter
      if (filter === 'open') {
        threads = threads.filter(t => !t.closed);
      } else if (filter === 'closed') {
        threads = threads.filter(t => t.closed);
      }

      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        threads = threads.filter(t =>
          t.subject.toLowerCase().includes(searchLower)
        );
      }

      // Sort by last activity (newest first)
      threads.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

      // Get selected thread content if specified
      let selectedThread = null;
      let messages = [];
      if (selectedThreadId) {
        // Verify thread belongs to this client by checking it's in the thread list
        const threadBelongsToClient = threads.some(t => t.id === selectedThreadId);
        if (threadBelongsToClient) {
          selectedThread = await missiveService.getConversation(selectedThreadId);
          if (selectedThread) {
            messages = await missiveService.getConversationMessages(selectedThreadId);
          }
        }
      }

      res.render('pages/dashboard', {
        title: 'Dashboard',
        threads,
        selectedThread,
        messages,
        selectedThreadId,
        filter,
        search,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.render('pages/dashboard', {
        title: 'Dashboard',
        threads: [],
        selectedThread: null,
        messages: [],
        selectedThreadId: null,
        filter,
        search,
        error: 'Unable to load threads. Please try again later.',
      });
    }
  },

  async getThreadContent(req, res) {
    const clientEmail = req.session.clientEmail;
    const clientCode = authService.getClientCode(clientEmail);
    const threadId = req.params.id;

    if (!clientCode) {
      return res.status(403).render('partials/reading-pane', {
        selectedThread: null,
        messages: [],
        error: 'Client configuration error.',
      });
    }

    try {
      // Verify thread belongs to this client by checking shared label
      const clientThreads = await missiveService.getConversationsForClient(clientCode);
      const threadBelongsToClient = clientThreads.some(t => t.id === threadId);

      if (!threadBelongsToClient) {
        return res.status(403).render('partials/reading-pane', {
          selectedThread: null,
          messages: [],
          error: 'You do not have access to this thread.',
        });
      }

      const thread = await missiveService.getConversation(threadId);

      if (!thread) {
        return res.status(404).render('partials/reading-pane', {
          selectedThread: null,
          messages: [],
          error: 'Thread not found.',
        });
      }

      const messages = await missiveService.getConversationMessages(threadId);

      res.render('partials/reading-pane', {
        selectedThread: thread,
        messages,
      });
    } catch (error) {
      console.error('Thread content error:', error);
      res.status(500).render('partials/reading-pane', {
        selectedThread: null,
        messages: [],
        error: 'Unable to load thread. Please try again later.',
      });
    }
  },
};
```

**Step 2: Create thread routes**

Create `src/routes/threads.js`:

```javascript
import { Router } from 'express';
import { threadController } from '../controllers/threadController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const threadRouter = Router();

threadRouter.get('/', requireAuth, threadController.showDashboard);
threadRouter.get('/threads/:id/content', requireAuth, threadController.getThreadContent);
```

**Step 3: Create dashboard page**

Create `views/pages/dashboard.ejs`:

```html
<%- include('../layouts/main', { body: `
  <div class="dashboard">
    <aside class="thread-list-panel">
      <div class="filters">
        <input
          type="text"
          placeholder="Search threads..."
          value="${search}"
          hx-get="/"
          hx-trigger="keyup changed delay:300ms"
          hx-target=".thread-list"
          hx-select=".thread-list"
          hx-push-url="true"
          name="search"
        >
        <select
          name="filter"
          hx-get="/"
          hx-trigger="change"
          hx-target=".thread-list"
          hx-select=".thread-list"
          hx-push-url="true"
          hx-include="[name='search']"
        >
          <option value="all" ${filter === 'all' ? 'selected' : ''}>All threads</option>
          <option value="open" ${filter === 'open' ? 'selected' : ''}>Open</option>
          <option value="closed" ${filter === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
      </div>

      <div class="thread-list">
        ${threads.length === 0 ? '<p class="no-threads">No threads found.</p>' : ''}
        ${threads.map(thread => `
          <a
            href="/?thread=${thread.id}&filter=${filter}&search=${encodeURIComponent(search)}"
            class="thread-card ${selectedThreadId === thread.id ? 'selected' : ''} ${thread.closed ? 'closed' : ''}"
            hx-get="/threads/${thread.id}/content"
            hx-target=".reading-pane"
            hx-push-url="/?thread=${thread.id}&filter=${filter}&search=${encodeURIComponent(search)}"
          >
            <div class="thread-status ${thread.closed ? 'closed' : 'open'}"></div>
            <div class="thread-info">
              <div class="thread-subject">${thread.subject}</div>
              <div class="thread-meta">${new Date(thread.lastActivityAt * 1000).toLocaleDateString()}</div>
            </div>
          </a>
        `).join('')}
      </div>
    </aside>

    <section class="reading-pane">
      ${typeof error !== 'undefined' && error ? `<div class="error">${error}</div>` : ''}
      ${selectedThread ? `
        <div class="thread-header">
          <h2>${selectedThread.subject}</h2>
          <span class="status-badge ${selectedThread.closed ? 'closed' : 'open'}">
            ${selectedThread.closed ? 'Closed' : 'Open'}
          </span>
        </div>
        <div class="messages">
          ${messages.length === 0 ? '<p class="no-messages">No client-visible updates for this thread.</p>' : ''}
          ${messages.map(msg => `
            <div class="message">
              <div class="message-header">
                <span class="message-date">${new Date(msg.deliveredAt * 1000).toLocaleString()}</span>
              </div>
              <div class="message-body">${msg.preview}</div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="no-selection">
          <p>Select a thread to view updates</p>
        </div>
      `}
    </section>
  </div>
` }) %>

<style>
.dashboard {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1rem;
  height: calc(100vh - 80px);
}

.thread-list-panel {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.filters {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filters input,
.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.thread-list {
  flex: 1;
  overflow-y: auto;
}

.no-threads {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.thread-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.thread-card:hover {
  background: #f9f9f9;
}

.thread-card.selected {
  background: #e8f4ff;
}

.thread-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.thread-status.open {
  background: #22c55e;
}

.thread-status.closed {
  background: #9ca3af;
}

.thread-info {
  flex: 1;
  min-width: 0;
}

.thread-subject {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thread-meta {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.reading-pane {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-y: auto;
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.thread-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.status-badge.open {
  background: #dcfce7;
  color: #166534;
}

.status-badge.closed {
  background: #f3f4f6;
  color: #4b5563;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-messages {
  color: #666;
  font-style: italic;
}

.message {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #0066cc;
}

.message-header {
  margin-bottom: 0.5rem;
}

.message-date {
  font-size: 0.75rem;
  color: #666;
}

.message-body {
  white-space: pre-wrap;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}
</style>
```

**Step 4: Create reading pane partial**

Create `views/partials/reading-pane.ejs`:

```html
<% if (typeof error !== 'undefined' && error) { %>
  <div class="error"><%= error %></div>
<% } else if (selectedThread) { %>
  <div class="thread-header">
    <h2><%= selectedThread.subject %></h2>
    <span class="status-badge <%= selectedThread.closed ? 'closed' : 'open' %>">
      <%= selectedThread.closed ? 'Closed' : 'Open' %>
    </span>
  </div>
  <div class="messages">
    <% if (messages.length === 0) { %>
      <p class="no-messages">No client-visible updates for this thread.</p>
    <% } else { %>
      <% messages.forEach(msg => { %>
        <div class="message">
          <div class="message-header">
            <span class="message-date"><%= new Date(msg.deliveredAt * 1000).toLocaleString() %></span>
          </div>
          <div class="message-body"><%= msg.preview %></div>
        </div>
      <% }) %>
    <% } %>
  </div>
<% } else { %>
  <div class="no-selection">
    <p>Select a thread to view updates</p>
  </div>
<% } %>
```

**Step 5: Update app.js to use thread routes**

Add to `src/app.js`:

```javascript
import { threadRouter } from './routes/threads.js';

// ... existing code ...

// Routes
app.use(authRouter);
app.use(threadRouter);
```

**Step 6: Verify dashboard loads**

Add a test client to the database and verify the dashboard loads.

```bash
node --env-file=.env -e "
import { authService } from './src/services/authService.js';
authService.addAllowedClient('test@example.com', 'Test Client');
console.log('Test client added');
"
```

**Step 7: Commit**

```bash
git add src/routes/threads.js src/controllers/threadController.js views/pages/dashboard.ejs views/partials/reading-pane.ejs src/app.js
git commit -m "feat: add thread routes with dashboard and reading pane"
```

---

## Task 10: Error Page and Polish

**Files:**
- Create: `views/pages/error.ejs`
- Update: `src/app.js`

**Step 1: Create error page**

Create `views/pages/error.ejs`:

```html
<%- include('../layouts/main', { body: `
  <div class="error-container">
    <div class="error-card">
      <h2>${title || 'Error'}</h2>
      <p>${message || 'Something went wrong.'}</p>
      <a href="/" class="btn">Go to Dashboard</a>
    </div>
  </div>
` }) %>

<style>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.error-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
}

.error-card h2 {
  margin-bottom: 1rem;
  color: #cc0000;
}

.error-card p {
  color: #666;
  margin-bottom: 1.5rem;
}
</style>
```

**Step 2: Add error handling to app.js**

Add to the end of `src/app.js`:

```javascript
// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: 'Not Found',
    message: 'The page you requested could not be found.',
    clientEmail: req.session?.clientEmail,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('pages/error', {
    title: 'Server Error',
    message: 'Something went wrong. Please try again later.',
    clientEmail: req.session?.clientEmail,
  });
});
```

**Step 3: Commit**

```bash
git add views/pages/error.ejs src/app.js
git commit -m "feat: add error pages and global error handling"
```

---

## Task 11: Final Integration and Testing

**Files:**
- Update: Various files as needed

**Step 1: Create a CLI script to add allowed clients**

Create `scripts/add-client.js`:

```javascript
#!/usr/bin/env node
import { authService } from '../src/services/authService.js';
import { runMigrations } from '../src/db/index.js';
import { getAllClientCodes, getLabelUUID } from '../src/services/clientLabels.js';

runMigrations();

const [email, name, clientCode] = process.argv.slice(2);

if (!email || !clientCode) {
  console.log('Usage: node scripts/add-client.js <email> <name> <client_code>');
  console.log('\nAvailable client codes:');
  getAllClientCodes().forEach(code => console.log(`  ${code}`));
  process.exit(1);
}

// Verify client code exists
if (!getLabelUUID(clientCode)) {
  console.error(`Error: Unknown client code "${clientCode}"`);
  console.log('\nAvailable client codes:');
  getAllClientCodes().forEach(code => console.log(`  ${code}`));
  process.exit(1);
}

authService.addAllowedClient(email, name, clientCode);
console.log(`Added client: ${email} (${name}) -> ${clientCode}`);
```

**Step 2: Update package.json with management script**

Add to `package.json` scripts:

```json
"add-client": "node --env-file=.env scripts/add-client.js"
```

**Step 3: Manual testing checklist**

1. Start server: `npm run dev`
2. Add a test client: `npm run add-client test@example.com "Test User"`
3. Visit http://localhost:3000 - should redirect to /login
4. Enter test email - should show "check email" page
5. Check terminal for magic link (or configure real SMTP)
6. Click magic link - should log in and show dashboard
7. Test filtering and search
8. Click threads to load in reading pane
9. Test logout

**Step 4: Final commit**

```bash
git add scripts/ package.json
git commit -m "feat: add client management script and complete MVP"
```

---

## Summary

This plan implements:

1. **Project setup** with proper dependencies and structure
2. **Configuration module** with environment validation
3. **SQLite database** for auth tokens and client allow-list
4. **Auth service** with secure magic link tokens
5. **Email service** for sending login links
6. **Missive service** with API client and caching
7. **Express app** with sessions and rate limiting
8. **Auth flow** (login, magic link, verify, logout)
9. **Dashboard** with split-pane UI and htmx interactivity
10. **Error handling** throughout

The codebase follows the layered architecture specified in the design document, with clear separation between routes, controllers, and services.
