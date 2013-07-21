var db = require('./db');

module.exports = function (opts) {

	var userUtils = {};

	function checkUser (json, cb) {
		db.findOne.user({email : json.email}, cb);
	}

	function updateFields (query, user, cb) {
		db.findOneAndUpdate(user, query, cb);
	}

	function get (fields, user, cb) {
		db.get.user(fields, user, cb);
	}

	userUtils.checkUser = checkUser;
	userUtils.updateFields = updateFields;
	userUtils.get = get;
	return userUtils;

};