var mongoose  = require('mongoose');

module.exports.controller = function(app) {

  // =====================================
  // Home Page ===========================
  // =====================================
  app.get('/', function(req, res) {
      // any logic goes here
      res.render('index', {title: "Babble"});
  });

  app.get('/side-bar', function(req, res){
    res.render('side-bar-ex', {});
  })

  // =====================================
  // Status = ============================
  // returns the status of the user ======
  // =====================================
  app.get('/status', function(req, res){
    data = {
      'status': 'loggedout'
    }
    if(req.user){
      data.status = 'loggedin'
    }
    res.send(data);
  });
}
