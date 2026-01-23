# Missive Client Portal

A secure client portal for viewing support threads from Missive. Clients can log in with magic links (no passwords) and view conversations filtered by their assigned labels.

## Features

- **Magic link authentication** - Passwordless login via email
- **Client-specific views** - Each client sees only their labeled conversations
- **Message filtering** - Shows only messages marked with `[CLIENT]` prefix
- **Split-pane UI** - Email-client-style interface with thread list and reading pane
- **Search and filters** - Find conversations quickly
- **API caching** - 5-minute cache for better performance
- **Direct Missive sync** - Client labels sync directly from Missive API

## Tech Stack

- **Backend**: Node.js + Express 5
- **Database**: SQLite (better-sqlite3)
- **Views**: EJS templating + htmx for interactivity
- **Auth**: Magic links with session-based authentication
- **Email**: Nodemailer

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `SESSION_SECRET` - Random string (at least 32 characters)
- `MISSIVE_API_TOKEN` - Your Missive API token
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email sending credentials
- `EMAIL_FROM` - Sender email address
- `APP_URL` - Your application URL (e.g., `http://localhost:3000`)

### 3. Sync client labels from Missive

**Important:** On first run, you must populate the database with client labels:

```bash
npm run sync-labels
```

This fetches all "Clients/*" shared labels from your Missive account and stores them in the database.

You can re-run this anytime to stay in sync with Missive (e.g., when you add new client labels).

### 4. Add allowed clients

Add email addresses that are allowed to log in:

```bash
npm run add-client user@example.com "Client Name" CLIENT_CODE
```

To see available client codes:

```bash
npm run add-client
```

### 5. Start the server

Development mode (with auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Visit `http://localhost:3000` to test.

## Management Scripts

- `npm run sync-labels` - Sync client labels from Missive API
- `npm run add-client` - Add allowed client email addresses
- `npm run inspect-db` - View database contents (labels, clients, tokens)
- `npm run test-smtp` - Test email configuration

## Architecture

### Layered Structure

- **Routes** (`src/routes/`) - HTTP endpoints
- **Controllers** (`src/controllers/`) - Request handling logic
- **Services** (`src/services/`) - Business logic (auth, email, Missive API)
- **Database** (`src/db/`) - SQLite with migrations
- **Views** (`views/`) - EJS templates

### Authentication Flow

1. User enters email on login page
2. If email is in `allowed_clients` table, send magic link
3. User clicks link with token
4. Token is verified and session is created
5. User is redirected to dashboard

### Data Flow

1. User logs in → session stores their email
2. Dashboard loads → looks up client code from `allowed_clients`
3. Fetch conversations → queries Missive API with shared label UUID
4. Display threads → filters messages by `[CLIENT]` marker

## Database Schema

- **magic_tokens** - One-time login tokens (15-minute expiry)
- **client_labels** - Synced from Missive "Clients/*" labels
- **allowed_clients** - Email addresses authorized to log in (FK to client_labels)

## Security Features

- Magic links with secure token hashing (SHA-256)
- Rate limiting on auth endpoints (5 requests per 15 minutes)
- Session-based authentication with HTTP-only cookies
- Email enumeration prevention (always shows success message)
- CSRF protection via session middleware
- Single-use tokens (invalidated after login)

## License

GPL-3.0-or-later
