var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt-nodejs');
var Schema    = mongoose.Schema;

var Account = new Schema({
  local : {
    email     : {type : String, required: true, unique: true },
    password  : {type : String, required: true },
  },
  google : {
    id        : String,
    token     : String,
    email     : String,
    name      : String
  }
});

// methods ======================

// ==============================
// generating a hash ============
// ==============================
Account.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// ==============================
// checking if password is valid
// ==============================
Account.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Account', Account);
