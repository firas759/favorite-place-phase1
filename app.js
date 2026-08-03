const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// 404 Page
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Not Found'
  });
});

app.listen(3000, () => {
  console.log('Running on http://localhost:3000');
});