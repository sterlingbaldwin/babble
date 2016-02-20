var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var Log = new Schema({
  parent: { type: Schema.Types.ObjectId, ref: 'Profile' },
  log_items: [{ type: Schema.Types.ObjectId, ref: 'Log_item' }]
});

Log.methods.get_items = function(){
  return this.log_items;
}

module.exports = mongoose.model('Log', Log);
