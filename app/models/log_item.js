var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Log_item = new Schema({
  parent: { type:Schema.Types.ObjectId, ref: 'Log'},
  action: { type: String },
  discussion: { type: Schema.Types.ObjectId, ref: 'Discussion' }
});


module.exports = mongoose.model('Log_item', Log_item);
