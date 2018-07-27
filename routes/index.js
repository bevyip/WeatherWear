var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Loc = require('../models/location');
var Weather = require('../models/weather');

const auth = require('./helpers/auth');

function setToday(){
  let n = new Date();
  let y = n.getFullYear();
  let m = n.getMonth();
  let d = n.getDate();

  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var newMonth = month[m];
  let ans = newMonth + " " + d + " " + y;
  return ans;
}

// set layout variables
router.use(function(req, res, next) {
  res.locals.title = "WeatherWear";
  res.locals.currentUserId = req.session.userId;

  next();
});

// main landing page
router.get('/', (req, res, next) => {
  const currentUserId = req.session.userId;
  const currentDate = setToday();

  // Weather.find({user: currentUserId, date: currentDate}, function(err, weather, location){
  Weather.find({user: currentUserId, date: currentDate}, function(err, weather){
    if(err) {
      // User's Input cannot be found
      // Front-end show no weather for today
      res.render('main', { currentUserId: currentUserId });
    } else {
      res.render('main', { currentUserId: currentUserId, weather: weather });
    }
  });
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
