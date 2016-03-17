var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var Group = new Schema({
  subscribed_profiles: [{ type: String }],
  privacy: Boolean, //false is public, true is private
  discussion_list: [{ type: Schema.Types.ObjectId, ref: 'Discussion' }],
  name: { type: String, unique: true },
  log: { type: Schema.Types.ObjectId, ref: 'Log'},
  action_list: [{ type: Schema.Types.ObjectId, ref: 'GroupAction'}],
  description: { type: String }
});

Group.method.compare = function(a,b) {
  if (a.name < b.name)
    return -1;
  else if (a.name > b.name)
    return 1;
  else
    return 0;
}



module.exports = mongoose.model('Group', Group);
