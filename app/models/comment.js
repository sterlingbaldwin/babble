var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var markdown  = require('markdown').markdown;

var Comment = new Schema({
  content: { type: String },
  parent_profile: { type: String }, //name of posters profile
  parent_comment: { type: Schema.Types.ObjectId }, //pointer to comment or discussion
  comment_list: [{ type: Schema.Types.ObjectId, ref: 'Comment'}] //children comments
});

Comment.methods.render = function(){
  return markdown.toHTML(this.content);
}

module.exports = mongoose.model('Comment', Comment);
