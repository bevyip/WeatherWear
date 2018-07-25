const express = require('express');
const router = express.Router();

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
const date_log = require('./dateLog')
const User = require('../models/user');
// const Weather = require('../models/weather');
//
// // goes to show all userInputs page (dateLog/ show.hbs)
// router.get('/', auth.requireLogin, (req, res, next) => {
//   DateLog.find()
// });

// when a form is submitted, it saves the new input and redirects
// to dateLog/ show.hbs - all dateLogs
router.post('/', auth.requireLogin, (req, res, next) => {
  let dateLog = new DateLog(req.body);

  dateLog.save(function(err, dateLog) {
    if(err) { console.error(err) };

    return res.redirect('/dateLog/show');
  });
});

// displays dateLog/ show.hbs - all dateLogs
router.get('/show', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;
  const dateId = req.session.dateId;

  DateLog.find({users: res.locals.currentUserId, date: res.locals.dateId}, function(err, dateLog){
    if(err) {
      console.error(err);
    } else {
      res.render('dateLog/show', { currentUserId: currentUserId, dateLog: dateLog });
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


// router.use('/userInput', user_input);
module.exports = router;
