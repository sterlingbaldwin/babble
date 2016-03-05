var mongoose      = require('mongoose');
var Profile       = require('../models/profile');
var Log           = require('../models/log');
var Account       = require('../models/account');


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

  app.get('/profile/:name/view', function(req, res){
    console.log(req.params.name);
    if(req.user){
      Profile
        .find({
          parent_user: req.user._id
        })
        .exec(function(err, docs){
          if(docs){
            var access = false;
            for(profile in docs){
              if(docs[profile].name == req.params.name){
                access = profile;
                break;
              }
            }
            if(access){
              res.render('profile_view', {
                profile: docs[profile]
              });
            } else {
              res.render('index');
            }
          } else {
            res.render('index');
          }
        })
    } else {
      res.render('index');
    }
  });

  app.get('/profile/:name/log', function(req, res){
    console.log('profile request for ' + req.params.name);
    if(req.user){ //user is logged in
      console.log(' [+] valid user');
      Profile //find profiles for the user
        .find({
          parent_user: req.user._id
        })
        .exec(function(err, docs){
          if(err){
            res.send('error:' + err);
            console.log(err);
          }
          if(docs){
            console.log(' [+] found profiles for user');
            console.log(docs);
            var access = false;
            for(profile in docs){
              if(docs[profile].name == req.params.name){
                access = profile;
                break;
              }
            }
            if(access){
              console.log(' [+] User has access to profile');
              res.send(docs[profile].notifications);
            } else {
              console.log(' [-] Unable to find profiles for user');
              res.send('Access denied');
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
  // Profile Delete ========================
  // Deletes the selected profile
  //=====================================
  // input: req.user <- the user
  //        req.body._id <- the id of the profile to delete
  app.post('/profile/delete', function(req, res){
    console.log('BODY');
    console.log(req.body);
    if(req.user){
      console.log('USER');
      console.log(req.user);
      Profile
        .findOne({
          _id: req.body._id
        })
        .exec(function(err, profile){
          try {
            if(profile){
              console.log('profile');
              console.log(profile);
              console.log("profile.parent_user " + profile.parent_user + ' = ' + req.user._id + ' req.user._id');
              console.log(profile.parent_user.toString() == req.user._id.toString());
              console.log(typeof profile.parent_user);
              console.log(typeof req.user._id);

              if(profile.parent_user.toString() == req.user._id.toString()){
                console.log('removing');
                profile.remove();
                res.send('Successfully removed profile ');
                return
              }
            } else {
              res.sendStatus(500);
            }
          } catch (e) {
            console.log(e);
          } finally {

          }
        });
    } else {
      res.redirect('/');
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
      try{
        var n = {
          type: 'NewProfile',
          status: 'unseen',
          content: 'Welcome to your new profile!'
        }
        var p = new Profile({
          name: req.body.name,
          parent_user: req.user._id,
          rep: 0,
          notifications: [{}]
        });
        //p.notifications.push(n);
        console.log(p);
        p.save({}, function(args){
          if(args)
          console.log(args);
        });

        n = {
          type: 'NewProfile',
          status: 'unseen',
          content: 'Welcome ' + req.user.local.email + ' to your new profile ' + p.name + '!'
        }
        p.notifications.push(n);
        p.save({}, function(args){
          if(args)
          console.log(args);
        });

        var data = {
          new_profile: p
        }

        console.log('Made a new profile!');
        console.log(data);
        res.send(data);
      } catch(error) {
        console.log(error);
      }
    } else {
      res.send('No user found');
    }
  });

}
