import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/index.js';
import { authRouter } from './routes/auth.js';

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

// Make session data available to views
app.use((req, res, next) => {
  res.locals.clientEmail = req.session?.clientEmail || null;
  next();
});

// Routes
app.use(authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
