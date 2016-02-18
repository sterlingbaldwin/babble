var mongoose = require('mongoose');
var Account  = require('../models/account');
var passport = require('passport');
module.exports.controller = function(app) {

  // =====================================
  // REGISTER ============================
  // =====================================
  app.post('/user/register', function(req, res){
    console.log(req.body);
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
      if (err) {
          console.log('error creating new account');
          console.log(account);
          return res.render('register', { account : account });
      }
      account.email = req.body.email
      account.save(function (err, account) {
        if (err) return console.error(err);
      });
      passport.authenticate('local')(req, res, function () {
          console.log('successfully created account');
          console.log(account);
          res.redirect('/');
      });
    });
  });

  // =====================================
  // LOGIN ==============================
  // =====================================
  app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
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
