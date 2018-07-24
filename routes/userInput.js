const express = require('express');
const router = express.Router();

const auth = require('./helpers/auth');
const UserInput = require('../models/userInput');
// const Weather = require('../models/weather');

// router.get('/', auth.requireLogin, (req, res, next) => {
//   const currentUserId = req.session.userId;
//
//   res.render('dateLog/compare', { currentUserId: currentUserId });
// });

module.exports = router;
