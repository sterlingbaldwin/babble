var mongoose  = require('mongoose');

module.exports.controller = function(app) {

  // =====================================
  // Home Page ===========================
  // =====================================
  app.get('/', function(req, res) {
      // any logic goes here
      res.render('index', {title: "Babble"});
  });

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
