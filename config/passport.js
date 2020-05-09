const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.serializeUser((users, done) => {
    return done(null, users.id);
})
passport.deserializeUser((id, done) => {
    User.findById(id, { userName: 'userName', storage: 'storage' }, (err, user) => {
        return done(err, user);
    })
})

//****************************************************************************local-signin
passport.use('local-signin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ email: email }, (err, users) => {
        if (err) {
            return done(err, false)
        }
        if (!users) {
            return done(null, false, req.flash('signinError', 'this user not found !'));
        }
        if (!users.comparePassword(password)) {
            return done(null, false, req.flash('signinError', 'wrong password'));
        }
        return done(null, users);
    })
}))
//****************************************************************************local-signup
passport.use('local-signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

    User.findOne({ email: email }, (err, users) => {
        if (err) {
            return done(err);
        }
        if (users) {
            return done(null, false, req.flash('signupError', "this email already exist"))
        }
        const newUser = new User({
            storage: 100,
            userName: req.body.username,
            email: email,
            password: new User().hashPassword(password)
        })
        newUser.save((err, users) => {
            if (err) {
                return done(err);
            }
            return done(null, users);
        })
    })
}))