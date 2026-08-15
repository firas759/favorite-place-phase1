require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'phase2-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2
  }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.theme = req.cookies.theme || 'light';
  next();
});

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);


app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Not Found'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('404', {
    title: 'Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
