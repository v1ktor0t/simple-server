const express = require('express');
const db = require('../db');
const { requireLogin } = require('./auth');

const router = express.Router();

router.get('/profile/:id', requireLogin, async (req, res, next) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).render('error', { message: 'User not found', stack: '' });
    res.render('profile', { user });
  } catch (err) {
    next(err);
  }
});

router.post('/profile/:id', requireLogin, async (req, res, next) => {
  const { full_name, email, phone, bio, role } = req.body;
  try {
    await db.run(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, bio = ?, role = COALESCE(?, role) WHERE id = ?',
      [full_name, email, phone, bio, role || null, req.params.id]
    );
    req.session.flash = 'Profile saved.';
    res.redirect('/profile/' + req.params.id);
  } catch (err) {
    next(err);
  }
});

router.get('/api/users/:id', requireLogin, async (req, res, next) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/api/messages/:id', requireLogin, async (req, res, next) => {
  try {
    const msg = await db.get('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    if (!msg) return res.status(404).json({ error: 'not found' });
    res.json(msg);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
