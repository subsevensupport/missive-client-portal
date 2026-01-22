export function requireAuth(req, res, next) {
  if (!req.session?.clientEmail) {
    return res.redirect('/login');
  }
  next();
}
