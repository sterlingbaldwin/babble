var mongoose  = require('mongoose');
var Profile   = require('../models/profile');

module.exports.controller = function(app) {

  // =====================================
  // Profile Page ========================
  // =====================================
  app.get('/profile', function(req, res){
    if(req.user)
      res.render('profile', {user: req.user});
    else
      res.redirect('/');
  });

  // =====================================
  // Profile List ========================
  // returns a list of a users profiles ==
  // =====================================
  app.get('/profile/list', function(req, res){
    Profile.find({parent_user: req.user._id}, function(err, docs){
      if(err){
        console.log(err);
        res.send('User has no profiles');
      } else {
        var profile_list = docs;
        res.send(profile_list);
      }
    });
  });

}
