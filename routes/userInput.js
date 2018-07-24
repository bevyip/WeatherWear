const express = require('express');
const router = express.Router();

const auth = require('./helpers/auth');
const UserInput = require('../models/userInput');
const dateLog = require('../models/dateLog');
// const Weather = require('../models/weather');

// goes to new userInput page
router.get('/new', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('/dateLog/new', { currentUserId: currentUserId });
});

// userInput create
router.post('/', auth.requireLogin, (req, res, next) => {
  dateLog.findById(req.params.dateLogId, function(err, dateLog) {
    if(err) { console.error(err) };

    let userInput = new UserInput(req.body);
    userInput.dateLog = dateLog;

    userInput.save(function(err, userInput) {
      if(err) { console.error(err) };

      return res.redirect(`/dateLog/show`);
    });
  });
});

module.exports = router;
