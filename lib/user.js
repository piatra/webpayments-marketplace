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

	function addPurchase (assetId, user, cb) {
		get({purchases:1}, user, function (err, user) {
			if (err) {
				console.log('error retrieving user');
				cb(err);
			} else {
				user.purchases.push(assetId);
				user.save(cb);
			}
		});
	}

	userUtils.checkUser = checkUser;
	userUtils.updateFields = updateFields;
	userUtils.get = get;
	userUtils.addPurchase = addPurchase;
	return userUtils;

};