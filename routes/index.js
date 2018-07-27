var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Loc = require('../models/location');
var Weather = require('../models/weather');

const auth = require('./helpers/auth');

// set layout variables
router.use(function(req, res, next) {
  res.locals.title = "WeatherWear";
  res.locals.currentUserId = req.session.userId;

  next();
});

// main landing page
router.get('/', (req, res, next) => {
  const currentUserId = req.session.userId;
  const currentDate = new Date();

  Weather.find({user: currentUserId, date: currentDate}, function(err, weather){
    if(err) {
      console.error(err);
    } else {
      res.render('/', { currentUserId: currentUserId, weather: weather });
    }
  });

  res.render('main', { currentUserId: currentUserId });
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
