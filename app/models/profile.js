var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;


var Profile = new Schema({
  name: { type: String, unique: true },
  parent_user: { type: Schema.Types.ObjectId, ref: 'Account' },
  subscribed_groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  rep: { type: Number },
  notifications: [{
    // type: String,
    // content: String,
    // status: String
  }],
  friends_list: [{ type: String }],
  profile_picture_path: { type: String, default:'batmap_profile.jpg' },
  profile_text : { type: String, default: 'Default profile text' }
});


Profile.methods.get_group_list = function(){
  return this.subscribed_groups;
}

module.exports = mongoose.model('Profile', Profile);
