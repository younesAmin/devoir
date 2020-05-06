var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
//const User = require('../models/User');
//const File = require('../models/File');
const passport = require('passport');
//const csrf = require('csurf');

//const multer = require('multer')

//router.use(csrf());

/*******************sign up *********************** */
/************************* *********************** */
/* GET users listing. */
router.get('/signup', isNotSignin, function (req, res, next) {
  var massagesError = req.flash('signupError');
  res.render('users/signup', { massages: massagesError });
});


/* POST users listing */
router.post('/signup', [
  check('username').not().isEmpty().withMessage('Please enter your username'),
  check('email').not().isEmpty().withMessage('Please enter your email'),
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('Please enter password more than 5 char'),
  check('password2').custom((value, { req }) => {
    if (value !== req.body.password) {

      throw new Error('Password and confirm-password are not equals')
    }
    return true;
  })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg)
    }
    req.flash('signupError', validationMassages);
    res.redirect('signup');
    return;
  }
  next();
}, passport.authenticate('local-signup', {
  session: false,
  successRedirect: 'signin',
  failureRedirect: 'signup',
  failureFlash: true,
}))

/*******************sign in *********************** */
/************************* *********************** */
//GET
router.get('/signin', isNotSignin, (req, res, next) => {
  var massagesError = req.flash('signinError');
  res.render('users/signin', { massages: massagesError });
})
//POST
router.post('/signin', [
  check('email').not().isEmpty().withMessage('Please enter your email'),
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').not().isEmpty().withMessage('Please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('Please enter password more than 5 char'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //console.log(errors.errors);

    var validationMassages = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassages.push(errors.errors[i].msg)
    }
    //console.log(validationMassages);
    req.flash('signinError', validationMassages);
    res.redirect('signin');
    return;
  }
  next();

}, passport.authenticate('local-signin', {

  successRedirect: '/profile',
  failureRedirect: 'signin',
  failureFlash: true,
}))
/*******************LogOut *********************** */
/************************* *********************** */

//GET
router.get('/logout', isSignin, (req, res, next) => {
  req.logOut();
  res.redirect('/');

})

function isSignin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('signin')
    return;
  }
  next();
}

function isNotSignin(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
    return
  }
  next();
}



module.exports = router;
