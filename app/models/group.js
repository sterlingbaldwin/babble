var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;


var Group = new Schema({
  subscribed_profiles: { type: Schema.Types.ObjectId, ref: 'Profile' },
  privacy: Boolean,
  discussion_list: [{ type: Schema.Types.ObjectId, ref: 'Discussion' }],
  name: String,
  log: { type: Schema.Types.ObjectId, ref: 'Log'},
  action_list: [{ type: Schema.Types.ObjectId, ref: 'GroupAction'}]
});


module.exports = mongoose.model('Group', Group);
