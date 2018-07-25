const express = require('express');
const router = express.Router();
const auth = require('./helpers/auth');

const UserInput = require('../models/userInput');
const dateLog = require('../models/dateLog');
// const Weather = require('../models/weather');

// goes to new userInput page
// Extra: if there already exists an input on this date, error!
router.get('/new', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;
  
  res.render('dateLog/new', { currentUserId: currentUserId });
});

// userInput create
// Extra: if there already exists an input on this date, error!
router.post('/', auth.requireLogin, (req, res, next) => {
  if(err) { console.error(err) };

  return res.redirect('/dateLog/show');

});

module.exports = router;
