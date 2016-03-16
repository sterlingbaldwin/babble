var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Log = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Group' },
  items: [{
    action: { type: String },
    discussion: { type: Schema.Types.ObjectId, ref: 'Discussion' }
  }]
});

Log.methods.get_items = function(){
  return this.log_items;
}

module.exports = mongoose.model('Log', Log);
