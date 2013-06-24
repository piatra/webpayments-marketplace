var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var UserSchema = new Schema({
	email : String,
	privateKey : String,
	publicKey : String,
	registered : {
		type: String, default: false
	},
	publicKeyUrl : String,
    owner : String,
    destination : String,
});

var schemas = {
	UserSchema : UserSchema
}

module.exports = schemas;