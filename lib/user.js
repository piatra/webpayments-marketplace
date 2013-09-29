var db = require('./db');

module.exports = function (opts) {

	var userUtils = {};

	function checkUser (json, cb) {
		db.findOne.user({email : json.email}, function (err, doc) {
			if (err) {
				console.log('error checking user');
				console.log(json, err);
				cb(err);
			} else {
				if (doc) {
					cb(null, doc);
				} else {
					db.create.user(json, cb);
				}
			}
		});
	}

	function isUnique (query, success, fail) {
		console.log('checking ',query);
		db.findOne.user(query, function (err, doc) {
			console.log('findOne retured', err, doc);
			if (err) {
				fail(err);
			} else {
				if (doc) {
					fail();
				} else {
					console.log('unique calling cb');
					success();
				}
			}
		});
	}

	function updateFields (query, user, cb) {
        db.findOneAndUpdate(user, query, cb);
	}

	function get (fields, user, cb) {
		console.log('get',fields,user);
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
    userUtils.isUnique = isUnique;
	userUtils.addPurchase = addPurchase;
	return userUtils;

};