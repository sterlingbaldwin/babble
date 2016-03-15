var Group       = require('../models/group');
var Discussion  = require('../models/discussion');


module.exports.controller = function(app) {


  //TODO: return group info
  app.get('/group/:name', function(req, res){

  });


  //TODO: create new group
  app.post('/group/create', function(req, res){

  });

  //TODO: create new discussion in the group
  app.post('/group/:name/new_discussion', function(req, res){

  })

  //TODO: destroy group
  app.post('/group/:name/delete', function(req, res){

  })

}
