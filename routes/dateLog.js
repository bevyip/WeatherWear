const express = require('express');
const router = express.Router();

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
const userInput = require('./userInput');
const UserInput = require('../models/userInput');
// const Weather = require('../models/weather');

// goes to compare page
router.get('/compare', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/compare', { currentUserId: currentUserId });
});

// goes to new userInput page
router.get('/new', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/new', { currentUserId: currentUserId });
});

// goes to show all userInputs page
router.get('/show', auth.requireLogin, (req, res, next) => {
  DateLog.findById(req.params.id, function(err, dateLog){
    if(err) { console.error(err) };

    res.render('dateLog/show', { dateLog: dateLog, userInput: userInput });
  });
});

router.use('/userInput', userInput);
module.exports = router;
