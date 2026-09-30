const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./config');
const dbModule = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Allow the partner dashboard to call this service from the browser.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// Make the current user available to every template.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

// Routes.
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/notes'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/admin'));

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/dashboard');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: err.message, stack: err.stack });
});

dbModule.seed().then(() => {
  app.listen(config.port, config.host, () => {
    console.log('');
    console.log('  ----------------------------------------------');
    console.log(`  URL:   http://${config.host}:${config.port}`);
    console.log('  Login: alice / alice123');
    console.log('');
  });
});
