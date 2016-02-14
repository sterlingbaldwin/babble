var mongoose = require('mongoose');
var Account = require('../models/account');
var passport = require('passport');
module.exports.controller = function(app) {
/**
 * a home page route
 */
  app.get('/user/register', function(req, res) {
      // any logic goes here
      res.render('register', {})
  });

  app.post('/user/register', function(req, res){
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
  });

  app.get('/login', function(req, res) {
    res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
}
