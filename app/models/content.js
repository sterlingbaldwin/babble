var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var markdown  = require('markdown').markdown;

var Content = new Schema({
  type: String,
  content: String
});

Content.methods.render = function(){
  if(this.type == 'markdown'){
    return markdown.toHTML(this.content);
  } else {
    return this.content;
  }
}


module.exports = mongoose.model('Content', Content);
