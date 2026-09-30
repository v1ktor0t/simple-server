const { exec } = require('child_process');
const express = require('express');
const db = require('../db');
const config = require('../config');
const { requireLogin } = require('./auth');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'Administrators only', stack: '' });
  }
  next();
}

router.get('/admin', requireLogin, requireAdmin, async (req, res, next) => {
  try {
    const users = await db.all('SELECT id, username, role, email FROM users ORDER BY id');
    res.render('admin', { users, output: null, command: null, secrets: config });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/ping', requireLogin, requireAdmin, async (req, res, next) => {
  const host = req.body.host || '127.0.0.1';
  const command = 'ping -c 1 ' + host;

  exec(command, { timeout: 10000 }, async (err, stdout, stderr) => {
    try {
      const users = await db.all('SELECT id, username, role, email FROM users ORDER BY id');
      const output = (stdout || '') + (stderr || '') || (err ? String(err) : '(no output)');
      res.render('admin', { users, output, command, secrets: config });
    } catch (e) {
      next(e);
    }
  });
});

router.post('/admin/report', requireLogin, requireAdmin, async (req, res, next) => {
  const formula = req.body.formula || '1 + 1';
  let output;
  try {
    output = String(eval(formula));
  } catch (e) {
    output = 'Error: ' + e.message;
  }
  try {
    const users = await db.all('SELECT id, username, role, email FROM users ORDER BY id');
    res.render('admin', { users, output, command: 'eval(' + formula + ')', secrets: config });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
