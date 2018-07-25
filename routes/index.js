var express = require('express');
var router = express.Router();
var User = require('../models/user');

const auth = require('./helpers/auth');

// set layout variables
router.use(function(req, res, next) {
  res.locals.title = "WeatherWear";
  res.locals.currentUserId = req.session.userId;

  next();
});

// where-are-you page
router.get('/', (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('index', { currentUserId: currentUserId });
});

// main landing page
router.get('/main', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('main', { title: 'WeatherWear', currentUserId: currentUserId });
});

// login
router.get('/login', (req, res, next) => {
  res.render('login');
});

// POST login
router.post('/login', (req, res, next) => {
  User.authenticate(req.body.email, req.body.password, (err, user) => {
    if (err || !user) {
      const next_error = new Error("Email or Password incorrect");
      next_error.status = 401;

      return next(next_error);
    } else {
      req.session.userId = user._id;

      return res.redirect('/') ;
    }
  });
});

// logout
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return next(err);
    });
  }

  return res.redirect('/login');
});

module.exports = router;
