const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
const date_log = require('./dateLog')
const User = require('../models/user');
const Location = require('../models/location');
// const Weather = require('../models/weather');

// when a form is submitted, it saves the new input and redirects
// to dateLog/ show.hbs - all dateLogs
router.post('/', auth.requireLogin, (req, res, next) => {

  request('https://maps.googleapis.com/maps/api/geocode/json?address=' + req.body.location + '&key=AIzaSyBEgWq5G822EXJIgfviFqJRf7vVE6_F5Lc', function (error, response, body){
    const json = JSON.parse(body);

    let dateLog = new DateLog(req.body);
    let location = new Location({
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

      return res.redirect('/');
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
