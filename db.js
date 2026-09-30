const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const config = require('./config');

const dbPath = path.resolve(__dirname, config.dbFile);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

// ---------------------------------------------------------------------------
// Promise helpers. The raw sqlite3 API uses callbacks.
// ---------------------------------------------------------------------------
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// `exec` runs several statements in one call.
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

// ---------------------------------------------------------------------------
// Schema and seed data.
// ---------------------------------------------------------------------------
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password      TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  api_token     TEXT,
  salary        INTEGER,
  bio           TEXT
);

CREATE TABLE IF NOT EXISTS notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user  INTEGER NOT NULL,
  to_user    INTEGER NOT NULL,
  subject    TEXT,
  body       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const USERS = [
  ['alice',   'alice112233',      'user',  'Alice Nguyen',  'alice@corp.local',  '555-0101', 'tok_alice_8f2b', 72000,  'Product designer.'],
  ['bob',     'hunter2',       'user',  'Bob Martinez',  'bob@corp.local',    '555-0102', 'tok_bob_19ac',   68000,  'Backend developer.'],
  ['carol',   'letmein',       'user',  'Carol Baptiste','carol@corp.local',  '555-0103', 'tok_carol_5d71', 91000,  'Finance lead.'],
  ['admin',   'admin!2021',    'admin', 'Dana Okafor',   'admin@corp.local',  '555-0100', 'tok_admin_c0de', 145000, 'Platform administrator.'],
  ['svc_bot', 'r0b0t-acc0unt', 'admin', 'Service Robot', 'bot@corp.local',    '',         'tok_bot_deadbeef', 0,    'Automation account.']
];

const NOTES = [
  [1, 'Sprint ideas',        'Move the onboarding tour to step 2.',                       'public'],
  [1, 'Bank details',        'Account 4402-1198. Do not share this note.',                'private'],
  [2, 'Deploy runbook',      'Restart the queue worker before the API.',                  'public'],
  [2, 'VPN credentials',     'user bob / pass hunter2 on vpn.corp.local',                 'private'],
  [3, 'Q3 payroll summary',  'Total payroll cost is 1.2M. Board review on Friday.',       'private'],
  [4, 'Incident 2024-07',    'Root cause was an unpatched parser. See the full report.',  'private']
];

const MESSAGES = [
  [4, 1, 'Welcome',        'Welcome to the internal portal, Alice.'],
  [3, 4, 'Budget',         'The finance export needs your approval.'],
  [2, 1, 'Code review',    'Please look at pull request 41.']
];

async function seed() {
  await exec(SCHEMA);

  const row = await get('SELECT COUNT(*) AS n FROM users');
  if (row.n > 0) return;

  for (const u of USERS) {
    await run(
      `INSERT INTO users (username, password, role, full_name, email, phone, api_token, salary, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      u
    );
  }
  for (const n of NOTES) {
    await run('INSERT INTO notes (user_id, title, body, visibility) VALUES (?, ?, ?, ?)', n);
  }
  for (const m of MESSAGES) {
    await run('INSERT INTO messages (from_user, to_user, subject, body) VALUES (?, ?, ?, ?)', m);
  }
  console.log('[db] seed data created');
}

async function reset() {
  await exec('DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS notes; DROP TABLE IF EXISTS messages;');
  await seed();
  console.log('[db] database reset');
}

module.exports = { db, run, get, all, exec, seed, reset };

// Allow `npm run reset`.
if (require.main === module && process.argv.includes('--reset')) {
  reset().then(() => db.close());
}
