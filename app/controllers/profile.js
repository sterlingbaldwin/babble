var mongoose  = require('mongoose');
var Profile   = require('../models/profile');
var Log       = require('../models/log');
var Account   = require('../models/account');

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

  app.get('/profile/userprofile/:name', function(req, res){
    console.log(req.params.name);
  });

  app.get('/profile/:name/log', function(req, res){
    if(req.user){
      Profile
        .find({
          parent_user: req.user._id
        })
        .exec(function(err, docs){
          if(err){
            res.send('error:' + err);
            console.log(err);
          }
          if(docs){
            var access = false;
            for(profile in docs){
              if(profile.name == req.params.name){
                access = true;
                break;
              }
            }
            if(access){
              var log_items = [];
              Log
                .find({
                  parent: docs[req.params.name]._id
                })
                .exec(function(err, docs){
                  if(err){
                    res.send('log lookup failed');
                    console.log(err);
                  } else {
                    if(docs){
                      console.log(docs[0].log_items);
                      res.send(docs[0].log_items);
                    } else {
                      res.send('no log_items found');
                    }
                  }
                });
            }
          } else {
            res.send('no user found');
          }
      });
    } else {
      res.send('No log items found');
    }
  });

  // =====================================
  // Profile List ========================
  // returns a list of a users profiles ==
  // =====================================
  app.get('/profile/list', function(req, res){
    if(req.user){
      Profile
        .find({
          parent_user: req.user._id
        })
        .exec(function(err, docs){
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
      //console.log(p);
      p.save();
      pLog.save();
      var data = {
        new_profile: p
      }
      res.send(data);
    } else {
      res.send('No user found');
    }
  });

}
