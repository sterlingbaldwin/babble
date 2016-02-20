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
  }));

  // =====================================
  // LOGIN ===============================
  // =====================================
  app.post('/user/login', passport.authenticate('local-login', {
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


  function isAuthenticated(req, res){
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
  }
}
