var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var GroupAction = new Schema({
  type: String, //type of action
  votes: Number, //net votes
  parent: { type: Schema.Types.ObjectId, ref: 'Group' },
  originator: { type: Schema.Types.ObjectId, ref: 'Profile' } //person that started the action,
  downvotes: Number
});

module.exports = mongoose.module('GroupAction', GroupAction);
