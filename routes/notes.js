const express = require('express');
const db = require('../db');
const { requireLogin } = require('./auth');

const router = express.Router();

router.get('/dashboard', requireLogin, async (req, res, next) => {
  try {
    const notes = await db.all(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC',
      [req.session.user.id]
    );
    const messages = await db.all(
      `SELECT m.*, u.username AS sender
       FROM messages m JOIN users u ON u.id = m.from_user
       WHERE m.to_user = ? ORDER BY m.id DESC`,
      [req.session.user.id]
    );
    res.render('dashboard', { notes, messages });
  } catch (err) {
    next(err);
  }
});

router.get('/notes/:id', requireLogin, async (req, res, next) => {
  try {
    const note = await db.get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) return res.status(404).render('error', { message: 'Note not found', stack: '' });

    const owner = await db.get('SELECT username FROM users WHERE id = ?', [note.user_id]);
    res.render('note', { note, owner });
  } catch (err) {
    next(err);
  }
});

router.post('/notes/:id/delete', requireLogin, async (req, res, next) => {
  try {
    await db.run('DELETE FROM notes WHERE id = ?', [req.params.id]);
    req.session.flash = 'Note ' + req.params.id + ' deleted.';
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.get('/notes/new', requireLogin, (req, res) => {
  res.render('note_new');
});

router.post('/notes', requireLogin, async (req, res, next) => {
  const { title, body, visibility } = req.body;
  try {
    const r = await db.run(
      'INSERT INTO notes (user_id, title, body, visibility) VALUES (?, ?, ?, ?)',
      [req.session.user.id, title, body, visibility === 'public' ? 'public' : 'private']
    );
    res.redirect('/notes/' + r.lastID);
  } catch (err) {
    next(err);
  }
});

router.get('/search', requireLogin, async (req, res, next) => {
  const q = req.query.q || '';
  let rows = [];
  let error = null;

  if (q) {
    const sql =
      "SELECT id, title, body, visibility, user_id FROM notes " +
      "WHERE visibility = 'public' AND title LIKE '%" + q + "%'";
    try {
      rows = await db.all(sql);
    } catch (err) {
      error = err.message;
    }
  }

  res.render('search', { q, rows, error });
});

module.exports = router;
