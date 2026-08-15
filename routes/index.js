const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();


const users = [];
const submissions = [];

const places = [
  {
    id: 1,
    name: 'King Hussein Park',
    city: 'Amman',
    description: 'One of the largest parks in Amman.',
    image: '/images/park.jpg'
  },
  {
    id: 2,
    name: 'Rainbow Street',
    city: 'Amman',
    description: 'A famous street with cafes and restaurants.',
    image: '/images/park.jpg'
  },
  {
    id: 3,
    name: 'Amman Citadel',
    city: 'Amman',
    description: 'A historical place with amazing views.',
    image: '/images/park.jpg'
  }
];

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login?error=Please%20login%20first');
  }
  next();
}

function renderValidationErrors(req, res, view, data = {}) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render(view, {
      title: data.title,
      errors: errors.array(),
      ...data
    });
  }
  return null;
}


router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

router.get('/features', (req, res) => {
  res.render('features', {
    title: 'Places',
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
    title: 'Contact',
    success: req.query.success,
    errors: [],
    formData: {}
  });
});

router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.'),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('contact', {
      title: 'Contact',
      errors: errors.array(),
      formData: req.body
    });
  }

  res.redirect('/contact?success=Your message was submitted successfully.');
});


router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');

  res.render('register', {
    title: 'Register',
    errors: [],
    formData: {}
  });
});

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('register', {
      title: 'Register',
      errors: errors.array(),
      formData: req.body
    });
  }

  const email = req.body.email.toLowerCase();
  if (users.some(user => user.email === email)) {
    return res.status(400).render('register', {
      title: 'Register',
      errors: [{ msg: 'An account with this email already exists.' }],
      formData: req.body
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  users.push({
    id: Date.now().toString(),
    name: req.body.name,
    email,
    password: hashedPassword,
    role: 'user'
  });

  res.redirect('/login?success=Registration%20successful.%20Please%20login.');
});


router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');

  res.render('login', {
    title: 'Login',
    error: req.query.error,
    success: req.query.success
  });
});

router.post('/login', [
  body('email').trim().isEmail().withMessage('Please enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('login', {
      title: 'Login',
      errors: errors.array()
    });
  }

  const email = req.body.email.toLowerCase();
  const user = users.find(item => item.email === email);

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).render('login', {
      title: 'Login',
      error: 'Invalid email or password.'
    });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  req.session.save(() => res.redirect('/dashboard'));
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


router.get('/dashboard', requireLogin, (req, res) => {
  const mySubmissions = submissions.filter(item => item.userId === req.session.user.id);

  res.render('dashboard', {
    title: 'Dashboard',
    submissionCount: mySubmissions.length
  });
});


router.get('/submit', requireLogin, (req, res) => {
  res.render('submit', {
    title: 'Submit Place',
    errors: [],
    formData: {},
    success: req.query.success
  });
});

router.post('/submit', requireLogin, [
  body('name').trim().notEmpty().withMessage('Place name is required.').isLength({ min: 2, max: 80 }).withMessage('Place name must be between 2 and 80 characters.'),
  body('city').trim().notEmpty().withMessage('City is required.').isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters.')
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('submit', {
      title: 'Submit Place',
      errors: errors.array(),
      formData: req.body
    });
  }

  submissions.push({
    id: Date.now().toString(),
    userId: req.session.user.id,
    name: req.body.name,
    city: req.body.city,
    description: req.body.description,
    createdAt: new Date()
  });

  res.redirect('/submit?success=Place%20submitted%20successfully.');
});


router.get('/my-submissions', requireLogin, (req, res) => {
  const mySubmissions = submissions.filter(item => item.userId === req.session.user.id);

  res.render('my-submissions', {
    title: 'My Submissions',
    submissions: mySubmissions
  });
});


router.get('/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();

  const results = query
    ? places.filter(place =>
        place.name.toLowerCase().includes(query) ||
        place.city.toLowerCase().includes(query) ||
        place.description.toLowerCase().includes(query)
      )
    : places;

  res.render('search', {
    title: 'Search Places',
    query: req.query.q || '',
    results
  });
});

router.get('/preferences', (req, res) => {
  res.render('preferences', {
    title: 'Preferences',
    theme: req.cookies.theme || 'light',
    success: req.query.success
  });
});

router.post('/preferences', (req, res) => {
  const theme = req.body.theme === 'dark' ? 'dark' : 'light';

  res.cookie('theme', theme, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true
  });

  res.redirect('/preferences?success=Preference%20saved%20successfully.');
});

module.exports = router;
