var mongoose      = require('mongoose');
var Profile       = require('../models/profile');
var Log           = require('../models/log');
var Account       = require('../models/account');
var Group         = require('../models/group');
var async         = require('async');
var fs            = require('fs');

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

  app.get('/profile/:profile/get_profile_text', function(req, res){
    if(!req.user){
      res.send('No profile found');
    } else {
      Profile.findOne({
        name: req.params.profile
      })
      .exec(function(err, doc){
        if(err || !doc || typeof doc === "undefined"){
          console.log('Error finding', req.params.profile);
          if(err) console.log(err);
        } else {
          res.send(doc.profile_text);
        }
      })
    }
  });

  app.post('/profile/:profile/set_profile_text', function(req, res){
    if(!req.user){
      res.send('No profile found');
    } else {
      Profile.findOne({
        name: req.params.profile
      })
      .exec(function(err, doc){
        if(err || !doc || typeof doc === "undefined"){
          console.log('Error finding', req.params.profile);
          if(err) console.log(err);
        } else {
          doc.profile_text = req.body.profile_text;
          doc.save();
          res.send(doc.profile_text);
        }
      })
    }
  });

  app.get('/profile/get_group_list/:name', function(req, res){
    if(!req.user){
      res.send('No user found');
    } else {
      Profile
        .find({
          parent_user: req.user._id
        })
        .exec(function(err, docs){
          if(docs){
            console.log(docs);
            var access = false;
            for(profile in docs){
              if(docs[profile].name == req.params.name){
                access = profile;
                break;
              }
            }
            if(access){
              group_info = [];
              calls = [];
              console.log('Pushing into call list');
              docs[access].subscribed_groups.forEach(function(group){
                calls.push(function(cb){
                  Group
                    .findOne({_id:group})
                    .exec(function(err, doc){
                      console.log('pushing into group_info');
                      console.log(doc);
                      group_info.push(doc);
                      cb();
                    });
                });
              });
              console.log('About to start async calls');
              async.parallel(calls, function(err, result){
                if(err){
                  console.log(err);
                  res.sendStatus(500);
                  return
                }
                console.log('SENDING RESPONSE');
                console.log(group_info);
                res.send(group_info.sort(Group.compare));
              });

            } else {
              res.render('index');
            }
          } else {
            res.render('index');
          }
      });
    }
  });

  app.post('/profile/:profile/mark_seen', function(req, res){
    Profile.findOne({
      'name': req.params.profile
    })
    .exec(function(err, profile){
      console.log('got a notification mark_seen request');
      if(err || typeof profile === "undefined" || !profile){
        console.log('unable to find profile');
        if(err)console.log(err);
        res.sendStatus(500);
      } else {
        for(n in profile.notifications){
          if(profile.notifications[n].content){
            console.log(profile.notifications[n]);
            profile.notifications[n].status = "seen";
            profile.markModified('notifications');
          }
        }
        console.log(JSON.stringify(profile.notifications));
        profile.save(function(err){
          if(err){
            console.log('error saving profile');
            console.log(err);
          }
        });
        res.send('Successfully marked all notifications as seen');
      }
    })
  })

  app.get('/profile/:name/friends_list', function(req, res){
    console.log('Got a friends list request');

    Profile.findOne({
      'name' : req.params.name
    })
    .exec(function(err, profile){
      if(err || typeof profile === "undefined" || !profile){
        console.log(err);
        res.sendStatus(500);
      } else {
        console.log('Sending', profile.friends_list);
        res.send(profile.friends_list);
      }
    });
  });


    app.post('/profile/:name/add_friend/:fname', function(req, res){
      console.log('got and add friend request from', req.params.name, 'to', req.params.fname);
      if(!req.user || typeof req.params.name === 'undefined' || typeof req.params.fname === 'undefined'){
        console.log('user doesnt match or error, sending to index');
        res.redirect('/');
      } else {
        Profile.findOne({
          'name': req.params.name
        })
        .exec(function(err, profile1){
          if(err || !profile1 || typeof profile1 === "undefined"){
            console.log('Profile ' + req.params.name +' not found');
            res.send('Could not find profile to add friend to');
            if(err)console.log(err);
          } else {
            var inList = false;
            for(f in profile1.friends_list){
              if(profile1.friends_list[f] == req.params.fname){
                inList = true;
              }
            }
            if(inList){
              console.log('User already in friends list');
              res.send('User already in friends list');
            } else {
              console.log('Adding', req.params.fname, 'as a friend to', profile1.name);
              profile1.friends_list.push(req.params.fname);
              profile1.save();
              res.send('Successfully added friend');

              //add to the notifications list for the new friend
              Profile.findOne({
                'name': req.params.fname
              })
              .exec(function(err, doc){
                var n = {
                  type: 'New Friend',
                  content: req.params.name + ' added you as a friend.',
                  status: 'unseen'
                }
                doc.notifications.push(n);
                doc.save();
              });
            }
          }
        });
      }
    });

  app.post('/profile/:name/remove_friend/:fname', function(req, res){
    console.log('got and add friend request from', req.params.name, 'to', req.params.fname);
    if(!req.user || typeof req.params.name === 'undefined' || typeof req.params.fname === 'undefined'){
      console.log('user doesnt match or error, sending to index');
      res.redirect('/');
    } else {
      Profile.update({
        'name': req.params.name
      }, {
        $pull: {
          friends_list: req.params.fname
        }
      }, function(err, num){
        console.log('num affected');
        console.log(num);
        if(err){
          console.log(err);
        }
        if(num.n > 0){
          console.log('removed', req.params.fname, 'from friends list of', req.params.name);
          res.send('Removed profile from friends_list');
        } else {
          //res.send('Unable to find profile to remove from friends_list');
          res.sendStatus(500);
        }
      })
      // Profile.findOne({
      //   'name': req.params.name
      // }).exec(function(err, doc){
      //   if(err || !doc || typeof doc === "undefined"){
      //     console.log(err);
      //     res.sendStatus(500);
      //   }
      //   var found = false;
      //   for(i in doc.friends_list){
      //     if(doc.friends_list[i] == req.params.fname){
      //       //doc.friends_list.splice(i, 1);
      //       doc.update()
      //       found = true;
      //     }
      //   }
      //   if(found){
      //     res.send('Removed profile from friends_list');
      //   } else {
      //     res.send('Unable to find profile to remove from friends_list');
      //   }
      // });
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
              res.redirect('/');
            }
          } else {
            res.redirect('/');
          }
        })
    } else {
      res.redirect('/');
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
        console.log(JSON.stringify(p));
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

        fs.createReadStream('public/images/batmap_profile.jpg').pipe(fs.createWriteStream('public/uploads/' + p.name + '.jpg'));

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
