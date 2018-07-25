const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
const date_log = require('./dateLog')
const User = require('../models/user');
// const Weather = require('../models/weather');

// when a form is submitted, it saves the new input and redirects
// to dateLog/ show.hbs - all dateLogs
router.post('/', auth.requireLogin, (req, res, next) => {
  let dateLog = new DateLog(req.body);
  dateLog.user = req.session.userId;

  dateLog.save(function(err, dateLog) {
    if(err) { console.error(err) };

    return res.redirect('/dateLog/all');
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
