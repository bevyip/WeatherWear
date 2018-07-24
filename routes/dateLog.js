const express = require('express');
const router = express.Router();

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
// const Weather = require('../models/weather');

router.get('/compare', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/compare', { currentUserId: currentUserId });
});

router.get('/new', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/new', { currentUserId: currentUserId });  
})

module.exports = router;
