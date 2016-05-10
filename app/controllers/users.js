var mongoose  = require('mongoose');
var Account   = require('../models/account');
var passport  = require('passport');

module.exports.controller = function(app) {

  // =====================================
  // REGISTER ============================
  // =====================================
  app.post('/user/register', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  },function(err, user, info){
    console.log(JSON.stringify(user));
  }));

  // =====================================
  // LOGIN ===============================
  // =====================================
  app.post('/user/login',
    passport.authenticate('local-login', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }));


  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/user/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // =====================================
  // PROFILE LOOKUP ======================
  // =====================================
  app.get('/profile', function(req, res){
    //
    // Get user information for req.user from
    //  the DB and send it back
    //
  });

  function isAuthenticated(req, res){
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
  }
}
