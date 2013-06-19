var mongoose = require('mongoose');
db = mongoose.connect('mongodb://localhost:27017/webpayments');

var UserSchema = db.Schema({
	email : String,
	privateKey : String,
	publicKey : String
});

var userUtils = {
	checkUser : function (json, cb) {
		console.log('checking user');


		var User = db.model('User', UserSchema);
		User.find({
			email : json.email
		}, function (err, docs) {
			console.log(json);
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
				cb();
			}
		})
	},
	handleNewUser : function (user, cb) {
		var keyUtils = require('../lib/keys.js');
		keyUtils.createKeyPair(function (pair) {
			user.publicKey = pair.publicKey;
			user.privateKey = pair.privateKey;
			user.save(function (err) {
				if (!err) cb();
				else console.log(err);
			});
		})
	}
}

module.exports = userUtils;