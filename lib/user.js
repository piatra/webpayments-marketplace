var mongoose = require('mongoose');
var keyUtils = require('../lib/keys.js');
var schemas = require('./schemas');
if (process.env.NODE_ENV)
	var db = mongoose.connect('mongodb://nodejitsu:c0a886dafe2c7d59cfc1d0d62e61ebff@dharma.mongohq.com:10074/nodejitsudb4747069906');
else
	var db = mongoose.connect('mongodb://localhost:27017/webpayments');

var User = db.model('User', schemas.UserSchema);

module.exports = function (opts) {

	var userUtils = {};

	function checkUser (json, cb) {
		User.findOne({
			email : json.email
		}, function (err, docs) {
			if (!docs) {
				userUtils.createNewUser(json.email, cb);
			} else {
				cb(docs);
			}
		})
	}

	function createNewUser (email, cb) {
		var user = new User({
			email : email
		});
		user.save(cb);
	}

	function updateFields (query, user, cb) {
		User.findOneAndUpdate(user, query, cb);
	}

	function get (fields, user, cb) {
		User.findOne(user, fields, function (err, docs) {
			console.log('get ', fields, 'from', user, '=>', docs);
			if (err) {
				cb(err);
			} else {
				cb (null, docs);
			}
		});
	}

	userUtils.checkUser = checkUser;
	userUtils.updateFields = updateFields;
	userUtils.get = get;
	return userUtils;

};