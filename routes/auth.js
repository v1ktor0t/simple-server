const express = require('express');
const db = require('../db');
const config = require('../config');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE username = '" + username +
    "' AND password = '" + password + "'";

  try {
    const user = await db.get(sql);

    if (!user) {
      return res.redirect('/login?error=' + encodeURIComponent('Unknown user ' + username));
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    };
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

router.get('/debug/config', (req, res) => {
  res.json(config);
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

module.exports = router;
module.exports.requireLogin = requireLogin;
