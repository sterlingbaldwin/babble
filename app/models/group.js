var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;


var Group = new Schema({
  subscribed_profiles: [{ type: String }],
  privacy: Boolean, //false is public, true is private
  discussion_list: [{ type: Schema.Types.ObjectId, ref: 'Discussion' }],
  name: { type: String, unique: true },
  log: { type: Schema.Types.ObjectId, ref: 'Log'},
  action_list: [{ type: Schema.Types.ObjectId, ref: 'GroupAction'}]
});


module.exports = mongoose.model('Group', Group);
