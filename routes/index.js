var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Loc = require('../models/location');
var Weather = require('../models/weather');
const request = require('request');

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

//main landing page
router.get('/', (req,res,next) => {
  res.render('landing');
})

// main landing page AFTER SIGN IN
router.get('/main',  auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;
  const currentDate = setToday();

  Weather.find({user: currentUserId, date: currentDate}, function(err, weather){
    if(err || weather.length === 0) {
      // User's Input cannot be found
      // Front-end show weather for current location, not user location
      res.render('main', { currentUserId: currentUserId });
    } else {
      res.render('main', { currentUserId: currentUserId, weather: weather});
    }
  });
});

//backend function for current location weather deets
router.get('/api/:lon/:lat', (req, res) => {
  const { lat, lon } = req.params;
  // request weather data with lat and lon...
  const api = `https://api.darksky.net/forecast/6f3be8512aa00bf20706bd64b3a6f127/${lat},${lon}`;

  request(api, function (error, response, body){
    const json = JSON.parse(body);
    const currentTemp = JSON.stringify(json.currently.temperature) + "°F";
    const currentFeels = JSON.stringify(json.currently.apparentTemperature) + "°F";
    const windSpeed = JSON.stringify(json.currently.windSpeed) + "°F";

    return res.json({ currentTemp: currentTemp, currentFeels: currentFeels, windSpeed });
  });
})

// login
router.get('/login', (req, res, next) => {
  res.render('login');
});

// POST login
router.post('/login', (req, res, next) => {
  User.authenticate(req.body.email, req.body.password, (err, user) => {
    if (err || !user) {
      return res.render('login', {showMessage: "true"});
    } else {
      req.session.userId = user._id;

      return res.redirect('main');
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

  return res.redirect('/');
});

module.exports = router;
