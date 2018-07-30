const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
const date_log = require('./dateLog')
const User = require('../models/user');
const Location = require('../models/location');
const Weather = require('../models/weather');

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


// when a form is submitted, it saves the new input and redirects
// to dateLog/ show.hbs - all dateLogs
router.post('/', auth.requireLogin, (req, res, next) => {

  // parsing google maps api to get long/ lat
  // parsing to input new weather object is nested inside
  request('https://maps.googleapis.com/maps/api/geocode/json?address=' + req.body.location + '&key=AIzaSyBEgWq5G822EXJIgfviFqJRf7vVE6_F5Lc', function (error, response, body){
    const json = JSON.parse(body);

    let dateLog = new DateLog(req.body);
    todayDate = setToday();
    dateLog.date = todayDate;

    let location = new Location({
      date: todayDate,
      location: req.body.location,
      long: JSON.stringify(json.results[0].geometry.location.lng),
      lat: JSON.stringify(json.results[0].geometry.location.lat)
    });

    location.user = req.session.userId;
    dateLog.user = req.session.userId;
    dateLog.long = JSON.stringify(json.results[0].geometry.location.lng);
    dateLog.lat = JSON.stringify(json.results[0].geometry.location.lat);

    location.save(function(err, loc) {
      if(err) { console.error(err) };
    });

    dateLog.save(function(err, dateLog) {
      if(err) { console.error(err) };
    });

    let long_needed = JSON.stringify(json.results[0].geometry.location.lng);
    let lat_needed = JSON.stringify(json.results[0].geometry.location.lat);

    // using long/lat to get weather information from Dark Sky API
    request('https://api.darksky.net/forecast/6f3be8512aa00bf20706bd64b3a6f127/' + lat_needed + ',' + long_needed, function (error, response, body){
      const json_2 = JSON.parse(body);

      let weather = new Weather({
        date: todayDate,
        highTemp: JSON.stringify(json_2.daily.data[0].temperatureMax) + "°F",
        lowTemp: JSON.stringify(json_2.daily.data[0].temperatureMin) + "°F",
        avgwindchill: JSON.stringify(json_2.daily.data[0].windSpeed) + "m/s",
        highfeels: JSON.stringify(json_2.daily.data[0].apparentTemperatureMax) + "°F",
        lowfeels: JSON.stringify(json_2.daily.data[0].apparentTemperatureMin) + "°F",
        avetemp: JSON.stringify(json_2.currently.apparentTemperature) + "°F"
      });

      weather.user = req.session.userId;
      weather.location = req.body.location;

      weather.save(function(err, dateLog) {
        if(err) { console.error(err) };

        return res.redirect('/');
      });
    });
  });

});

// displays dateLog/ show.hbs - all dateLogs
router.get('/all', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  DateLog.find({user: currentUserId}, function(err, dateLogs){
    if(err) {
      console.error(err);
    } else {
      res.render('dateLog/all', { currentUserId: currentUserId, dateLogs: dateLogs });
    }
  });
});

// goes to compare page
router.get('/compare', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/compare', { currentUserId: currentUserId });
});

// goes to new input page (dateLog/ new.hbs)
router.get('/new', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/new', { currentUserId: currentUserId });
});

module.exports = router;
