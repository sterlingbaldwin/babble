var mongoose = require('mongoose');
module.exports.controller = function(app) {
/**
 * a home page route
 */
  app.get('/', function(req, res) {
      // any logic goes here
      res.render('index')
  });
}
