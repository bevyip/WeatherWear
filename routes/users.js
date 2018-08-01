const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('./helpers/auth');

/* GET users listing. */
router.get('/', auth.requireLogin, (req, res, next) => {
  User.find({}, 'email', function(err, users) {
    if(err) {
      res.render('users/new');
    }
    res.render('main');
  });
});

// Users new
router.get('/new', function(req, res, next) {
  res.render('users/new');
});

// Users create
router.post('/', (req, res, next) => {
  const newUser = new User(req.body);

  User.find({email: newUser.email}, function(err, user){
    if (err || user.length === 0){ // email doesn't exist so GOOD!
      newUser.save(function(err, user) {
        if (err) {
          console.log(err);
        }
        req.session.userId = newUser._id;

        res.render('main', { currentUserId: req.session.userId});
      });
    } else { //email exists
      res.render('users/new', {showMessage: "true"});
    }
  })
});

module.exports = router;
