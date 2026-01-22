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
