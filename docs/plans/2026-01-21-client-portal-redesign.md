# Client Portal Redesign - Design Document

**Date:** 2026-01-21
**Goal:** Rebuild the Missive client portal from scratch using industry-standard architecture, with a focus on clean code structure and security best practices.

## Overview

A production-ready, read-only client portal allowing customers to view their Missive support threads. Clients authenticate via magic links and can browse, search, and filter their threads in a split-pane email-style interface.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stack | Node.js + Express + EJS + htmx | Server-rendered simplicity, htmx for interactivity without SPA complexity |
| Architecture | Layered (routes → controllers → services) | Clean separation of concerns, maintainable and testable |
| Auth | Magic links with email allow-list | User-friendly, no passwords to manage, controlled access |
| Data | Direct Missive API with 5-min in-memory cache | Simple, no sync complexity, fresh enough for support portal |
| Database | SQLite | Only needed for magic link tokens; zero external dependencies |
| Message visibility | Marker-based filtering (`[CLIENT]` prefix) | Single source of truth in Missive, no sync needed |
| UI | Split-pane layout (thread list + reading pane) | Email-client UX, fast scanning without page reloads |

## Project Structure

```
missive-client-portal/
├── src/
│   ├── app.js                 # Express app setup (middleware, routes)
│   ├── server.js              # Entry point (starts server)
│   ├── config/
│   │   └── index.js           # Environment config, constants
│   ├── routes/
│   │   ├── auth.js            # Magic link request/verify
│   │   └── threads.js         # Thread listing, detail views
│   ├── controllers/
│   │   ├── authController.js  # Handles auth logic
│   │   └── threadController.js
│   ├── services/
│   │   ├── missiveService.js  # Missive API client + caching
│   │   ├── authService.js     # Token generation/verification
│   │   └── emailService.js    # Sending magic links
│   ├── middleware/
│   │   └── requireAuth.js     # Protects authenticated routes
│   ├── db/
│   │   ├── index.js           # SQLite connection
│   │   └── migrations/        # Schema versioning
│   └── utils/
│       └── ...                # Shared helpers
├── views/                     # EJS templates
│   ├── layouts/
│   │   └── main.ejs           # Base layout
│   ├── pages/
│   │   ├── login.ejs          # Email input form
│   │   ├── check-email.ejs    # "Check your email" confirmation
│   │   └── dashboard.ejs      # Split-pane thread list + reading pane
│   ├── partials/
│   │   ├── thread-card.ejs    # Thread preview for list
│   │   ├── message.ejs        # Single message display
│   │   ├── reading-pane.ejs   # Thread detail content
│   │   └── filters.ejs        # Search/filter controls
│   └── error.ejs              # Friendly error page
├── public/                    # Static assets (CSS, images)
├── tests/                     # Test files mirroring src/
└── package.json
```

## Authentication Flow

1. Client enters email on `/login`
2. Server validates email is in allow-list
3. Server generates token, stores `hash(token)` in SQLite with 15-min expiry
4. Server sends magic link via email
5. Client clicks link → `/auth/verify?token=xxx`
6. Server validates token, creates session (HTTP-only cookie), deletes token
7. Client is redirected to dashboard

**Security measures:**
- Tokens hashed before storage
- Single-use tokens (deleted after verification)
- 15-minute expiry
- Rate limiting on `/auth/request-link`
- Email allow-list (only registered clients can log in)

## Data Flow

```
Client Browser → Portal Server → Missive API
                     ↓
              In-memory cache
              (5-min TTL, per-client)
```

- Fetch threads from Missive API on cache miss
- Filter threads to only those where client is a participant
- Filter messages to only those with `[CLIENT]` marker
- Strip marker before displaying to client
- Cache responses keyed by client email

## Routes

### Public
- `GET /login` - Login page
- `POST /auth/request-link` - Send magic link
- `GET /auth/verify` - Verify token, create session

### Authenticated
- `GET /dashboard` - Main split-pane view
- `GET /threads/:id/content` - Thread detail (htmx partial)
- `POST /logout` - End session

## UI Layout

Split-pane design (email-client style):
- Left panel: Thread list with search/filter
- Right panel: Reading pane showing selected thread's messages
- htmx handles loading thread content without full page reload

## Error Handling

| Error Type | Response |
|------------|----------|
| ValidationError | 400 + friendly message |
| AuthError | 401 + redirect to /login |
| ForbiddenError | 403 + "You don't have access" |
| NotFoundError | 404 + "Thread not found" |
| MissiveAPIError | 503 + "Temporarily unavailable" |
| UnexpectedError | 500 + generic message, log details |

Principles:
- Never expose stack traces to clients
- Log errors with context (timestamp, client email, request ID)
- Show cached data + "may be stale" notice if Missive API fails

## Database Schema

```sql
CREATE TABLE magic_tokens (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE allowed_clients (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
```

## MVP Scope

**Included:**
- Magic link authentication
- View list of client's threads
- Search threads by subject/content
- Filter threads by status (all/open/closed)
- View client-visible messages in reading pane
- Logout

**Excluded (future):**
- Client replying to threads
- Real-time updates via webhooks
- Push notifications

## Dependencies

```json
{
  "dependencies": {
    "express": "^5.x",
    "ejs": "^4.x",
    "better-sqlite3": "^11.x",
    "express-session": "^1.x",
    "express-rate-limit": "^7.x",
    "nodemailer": "^6.x",
    "node-cache": "^5.x"
  }
}
```
