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
