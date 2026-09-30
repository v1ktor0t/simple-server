# VulnShop Portal — cybersecurity training application

A small internal notes portal built with Node.js, Express and SQLite. Users
write notes, search public notes, send messages and edit their profile.

The application carries defects on purpose. Your task is to find them.

> **Warning**
> This application has no security. Bind it to `127.0.0.1` only. Never put it
> on a public network.

## Install and start

```bash
npm install
npm start
```

Open http://127.0.0.1:3000.

To put the database back to its start state:

```bash
npm run reset
```

## Your account

| Username | Password   |
| -------- | ---------- |
| `alice`  | `alice123` |

Other accounts exist. You must find a way into them.

## Scope

The application holds at least one defect in each of these categories:

- SQL injection
- Cross site scripting
- Insecure direct object reference
- Remote code execution
- Hardcoded secrets
- Missing security headers

The source code is in the repository. Use it, or work from the browser only.

## Objectives

1. Log in as an administrator without the administrator password.
2. Read the private note of another user.
3. Read the salary of every employee.
4. Steal the session cookie of another user.
5. Raise your own account to the administrator role.
6. Run an operating system command on the host.
7. List every credential that the application holds.
8. Name each security header that the server does not send.

## Layout

```
app.js            Express setup and session
config.js         Service configuration
db.js             SQLite schema and seed data
routes/           Request handlers
views/            EJS templates
public/style.css  Styles
data/app.db       SQLite database, created on first start
```

## Report

For each finding, write:

- The category and the affected request.
- The exact input that proves the defect.
- The effect on the business.
- The code change that repairs it.
