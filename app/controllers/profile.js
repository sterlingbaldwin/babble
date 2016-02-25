var mongoose  = require('mongoose');
var Profile   = require('../models/profile');
var Log       = require('../models/log');

module.exports.controller = function(app) {

  // =====================================
  // Profile Page ========================
  // =====================================
  app.get('/profile', function(req, res){
    if(req.user){
      console.log(req.user);
      res.render('profile',{
        user: req.user
      });
    } else{
      res.redirect('/');
    }
  });

  // =====================================
  // Profile List ========================
  // returns a list of a users profiles ==
  // =====================================
  app.get('/profile/list', function(req, res){
    if(req.user){
      Profile.find({parent_user: req.user._id}, function(err, docs){
        if(err){
          console.log(err);
          res.send('User has no profiles');
        } else {
          res.json({
            profile_list: docs,
            user: req.user
          });
        }
      });
    } else {
      res.send('No user found');
    }
  });

  // ====================================
  // Profile New ========================
  // Creates a new profile and populates
  // it with the given name. Creates a new
  // log and attaches it to the profile
  // creates a New Profile Notification
  // for the new profile
  //=====================================
  // input: req.body.name
  app.post('/profile/new', function(req, res){
    if(req.user){
      var p = new Profile({
        name: req.body.name,
        parent_user: req.user._id,
        rep: 0,
      });
      pLog = new Log({
        parent: p._id
      })
      console.log(p);
      p.save();
      pLog.save();

      cb = function(err, docs){
        if(err){
          console.log(err);
          res.send('User has no profiles');
        } else {
          console.log(docs);
          var profile_list = docs;
          res.send(profile_list);
        }
      }
      Profile.find({parent_user: req.user._id}).sort({name: -1}).exec(cb);
    } else {
      res.send('No user found');
    }
  });

}
