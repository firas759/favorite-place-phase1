const express = require('express');
const router = express.Router();

const places = [
  {
    id: 1,
    name: 'King Hussein Park',
    description: 'One of the largest parks in Amman.',
    image: '/images/park.jpg'
  },
  {
    id: 2,
    name: 'Rainbow Street',
    description: 'A famous street with cafes and restaurants.',
    image: '/images/park.jpg'
  },
  {
    id: 3,
    name: 'Amman Citadel',
    description: 'A historical place with amazing views.',
    image: '/images/park.jpg'
  }
];

router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

router.get('/features', (req, res) => {
  res.render('features', {
    title: 'Features',
    places
  });
});

router.get('/place/:id', (req, res) => {
  const place = places.find(p => p.id == req.params.id);

  if (!place) {
    return res.status(404).render('404', {
      title: 'Not Found'
    });
  }

  res.render('place', {
    title: 'Place Details',
    place
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact'
  });
});

module.exports = router;