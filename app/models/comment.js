var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Comment = new Schema({
  child_content: { type: Schema.types.ObjectId, ref: 'Content' },
  parent_profile: { type: Schema.types.ObjectId, ref: 'Profile' },
  parent_comment: { type: Schema.types.ObjectId, ref: 'Comment'},
  comment_list: [{ type: Schema.types.ObjectId, ref: 'Comment'}]
});

module.exports = mongoose.model('Comment', Comment);
