var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Discussion = new Schema({
  parent_id: { type: Schema.Types.ObjectId }, //group or log
  comment: { type: Schema.Types.ObjectId, ref: 'Comment'},
  title: { type: String },
  description: { type: String }
});

module.exports = mongoose.model('Discussion', Discussion);
