var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Notification = new Schema({
  type: String,
  content: { type: Schema.Types.ObjectId, ref: 'Content' }
});

module.exports = mongoose.model('Notification', Notification);
