var Group       = require('../models/group');
var Discussion  = require('../models/discussion');
var Profile     = require('../models/profile');

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


  /*
  required input ->  name of profile making create request, sub_names
                     name of the new group, group_name
  optional input ->  list of users to add to group, sub_names
                     privacy setting (defaults to private), privacy
  */
  app.post('/group/create', function(req, res){
    if(!req.user || !req.body.group_name || !req.body.sub_names){
      console.log(req.body);
      res.send('Invalid group create request');
      return;
    }
    var privacy = true;
    if(req.body.privacy){
      privacy = req.body.privacy;
    }

    g = new Group({
      name: req.body.group_name,
      privacy: privacy,
      subscribed_profiles: req.body.sub_names
    });
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
