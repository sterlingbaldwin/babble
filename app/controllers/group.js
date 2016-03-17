var Group       = require('../models/group');
var Discussion  = require('../models/discussion');
var Comment     = require('../models/comment');
var Profile     = require('../models/profile');
var Log         = require('../models/log');
var async       = require('async');

module.exports.controller = function(app) {

  app.get('/group/:name', function(req, res){
    Group
      .findOne({
        'name': req.params.name
      }).exec(function(err, doc){
        if(err){
          console.log(err);
          res.sendStatus(500);
        }
        if(!doc){
          console.log('Unable to find group: ' + req.params.name);
          res.send('Could not find group');
        }
        res.send(doc);
      });
  });

  app.get('/groups/public_group_search', function(req, res){
    if(!req.user){
      res.render('index');
    }
    Group
      .find({
        'privacy': false
      }).exec(function(err, docs){
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        res.send(docs);
      });
  });

  app.get('/group/:name/view', function(req, res){
    if(!req.user){
      res.redirect('index');
    }
    //TODO: Check if the user is authorized to look at this group
    Group
      .findOne({
        'name': req.params.name
      })
      .exec(function(err, doc){
        if(err){
          callback(err);
        }
        res.render('group', {group: doc})
      });
  });

  app.get('/group/:gid/get_discussion_list', function(req, res){
    if(!req.user){
      res.redirect('index');
    }
    Group
      .findById(req.params.gid)
      .exec(function(err, doc){
        if(err){
          console.log(err);
          res.sendStatus(500);
        }
        if(!doc){
          res.send('Unable to find group');
        }
        var calls = [];
        var posts = [];

        try {
          doc.discussion_list.forEach(function(discussion){ //for each discussion
            calls.push(function(cb){ //push into the calls list
              Discussion //find that discussion
                .findById(discussion)
                .exec(function(err, disc){
                  Comment //for the discussions original post
                    .findById(disc.comment)
                    .exec(function(err, comment){ //find the OP
                      posts.push(comment.render());
                      cb();
                    });
                });
            });
          });
          async.parallel(calls, function(err, result){
            if(err){
              console.log(err);
              res.sendStatus(500);
              return
            }
            console.log('SENDING RESPONSE');
            console.log(posts);
            res.send(posts);
          })
        } catch (e) {
          console.log(e);
        } finally {

        }

      });
  });


  /*
  required input ->  name of profile making create request, sub_names
                     name of the new group, group_name
  optional input ->  list of users to add to group, sub_names
                     privacy setting (defaults to private), privacy
                     description of the group, group_description
  */
  app.post('/group/create', function(req, res){

    if(!req.user || !req.body.group_name || !req.body.sub_names){
      console.log(req.body);
      res.send('Invalid group create request');
      return;
    }
    var privacy = true;
    if(typeof req.body.privacy !== 'undefined'){
      privacy = req.body.privacy;
    }

    var description = '';
    if(!req.body.group_description){
      description = 'A new group';
    } else {
      description = req.body.group_description;
    }

    try {
      g = new Group({
        name: req.body.group_name,
        privacy: privacy,
        subscribed_profiles: req.body.sub_names,
        description: description
      });
      l = new Log({
        parent: g._id
      });
      d = new Discussion({
        parent_id: l._id
      });
      d.save();
      l.items.push({
        action: 'Group Created',
        discussion: d._id
      });
      l.save();
      g.log = l._id;
      g.save(function(err, item){
        if(err){
          console.log(err);
          res.sendStatus(500);
        }
        for(p in req.body.sub_names){
          console.log('Adding ' + item + ' to ' + req.body.sub_names[p] + 's list of subscribed_groups');
          Profile
            .update({
              'name': req.body.sub_names[p]
            }, {
              $push: {
                subscribed_groups: item._id
              }
            }, function(args){
              console.log(args);
            });
        }
      });
    } catch (e) {
      console.log(e);
    } finally {

    }
    res.send(g);
  });

  app.post('/group/:name/new_discussion', function(req, res){
    if(!req.user){
      res.send('Invalid new_discussion request');
    }
    Group
      .findOne({
        'name': req.params.name
      }).exec(function(err, doc){
        if(err){
          console.log(err);
          res.sendStatus(500);
        }
        if(!doc){
          res.send('Unable to find group with given name: ' + req.params.name);
        }
        d = new Discussion({
          parent_id: doc._id
        });
        d.save(function(err, item){
          Group
            .update({
              _id: doc._id
            }, {
              $push: {
                'discussion_list': item._id
              }
            });
        });
      });
  })

  app.post('/group/:name/delete', function(req, res){
    if(!req.user){
      res.send('Invalid group delete request');
    }
    Group
      .remove({
        'name': req.params.name
      }, function(args){
        console.log('Removed group');
        console.log(args);
      });
  });

}
