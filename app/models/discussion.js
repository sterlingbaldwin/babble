var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Discussion = new Schema({
  parent_id: { type: Schema.Types.ObjectId, ref: 'Group' },
  comment_list: { type: Schema.Types.ObjectId, ref: 'Comment'}
});

module.exports = mongoose.model('Discussion', Discussion);
