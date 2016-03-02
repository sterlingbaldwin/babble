var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Discussion = new Schema({
  parent_id: { type: Schema.types.ObjectId, ref: 'Group' },
  comment_list: { type: Schema.types.ObjectId, ref: 'Comment'}
});

module.exports = mongoose.module('Discussion', Discussion);
