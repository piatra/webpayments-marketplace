var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/webpayments');
var schemas = require('./schemas');

var userUtils = {
	checkUser : function (json, cb) {
		var schemas = require('./schemas.js');
		var User = db.model('User', schemas.UserSchema);
		User.findOne({
			email : json.email
		}, function (err, docs) {
			if (!docs) {
				checkUser.createNewUser(json.email, cb);
			} else {
				cb(docs);
			}
		})
	},
	createNewUser : function (email) {
		console.log('created new user');
		var user = new User({
			email : email
		});
		user.save(function (err, newUser) {
			if (err) {
				console.log('error trying to create new user ' + err);
			} else {
				userUtils.handleNewUser(newUser, cb);
			}
		});
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
	},
	getPrivateKey : function (user, cb) {
		var User = db.model('User', schemas.UserSchema);
		User.find({
			email : user
		}, function (err, docs) {
			console.log('users.js 44', err, docs[docs.length-1].privateKey); // fix me
			cb(err, docs[docs.length-1].privateKey);
		})
	},
	updateFields : function (query, condition, cb) {
		var User = db.model('User', schemas.UserSchema);
		User.findOneAndUpdate(condition, query, cb);
	}
}

module.exports = userUtils;