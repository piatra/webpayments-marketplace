var mongoose = require('mongoose');
db = mongoose.connect('mongodb://localhost:27017/webpayments');

var UserSchema = db.Schema({
	email : String,
	privateKey : String,
	publicKey : String,
	registered : {
		type: String, default: false
	}
});

var userUtils = {
	checkUser : function (json, cb) {
		console.log('checking user');


		var User = db.model('User', UserSchema);
		User.findOne({
			email : json.email
		}, function (err, docs) {
			if (!docs.length) {
				console.log('user ' + json.email + ' not found');
				var user = new User({email : json.email});
				user.save(function (err, newUser) {
					if (err) {
						console.log('error trying to create new user ' + err);
					} else {
						userUtils.handleNewUser(newUser, cb);
					}
				})
			} else {
				console.log('user found');
				cb(docs);
			}
		})
	},
	handleNewUser : function (user, cb) {
		var keyUtils = require('../lib/keys.js');
		keyUtils.createKeyPair(function (pair) {
			user.publicKey = pair.publicKey;
			user.privateKey = pair.privateKey;
			user.save(function (err) {
				if (!err) cb(user);
				else console.log(err);
			});
		})
	}
}

module.exports = userUtils;