var _ = require('underscore'),
	fs = require('fs'),
	user = require('../lib/user')(),
	keys = require('../lib/keys')(),
	async = require('async')
	utils = require('../lib/utils')()
;

module.exports = function (options) {
	var assetUtils = {};

	function sign (req, cb) {
		createListing(req, function (err, signedListing) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				createAsset(req, function (err, signedAsset){
					if (err) {
						console.log(err);
						cb(err);
					} else {
						cb(null, signedListing, signedAsset);
					}
				});
			}
		});
	}

	function createListing (req, cb) {
		console.log('createListing');
		fs.readFile('./lib/listing.simple.cfg', 'utf8', function (err, message) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				try {
					message = JSON.parse(message);
				} catch (e) {
					console.log(e);
					cb(e);
				}
				_.map(req.body, function (value, key) {
					utils.setValue.call(message, key, value);
				});
				signAsset(message, cb);
			}
		});
	}

	function createAsset (req, cb) {
		console.log('createAsset');
		fs.readFile('./lib/asset.simple.cfg', 'utf8', function (err, message) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				try {
					message = JSON.parse(message);
				} catch (e) {
					console.log(e);
					cb(e);
				}
				req.body.creator = {fullName: req.body.author};
				delete req.body.author;
				_.map(req.body, function (value, key) {
					utils.setValue.call(message, key, value);
				});
				setAssetProvider(message, req.body.email, cb);
			}
		});
	}

	function setAssetProvider (message, email, cb) {
		user.get({owner:1}, {email:email || 'andrei.br92@gmail.com'}, function (err, doc) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				message.assetProvider = doc.owner;
				signAsset(message, cb);
			}
		});
	}

	function signAsset (message, cb) {
		keys.sign(message, function (err, signedAsset) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				cb(null, signedAsset);
			}
		});
	}

	// sign is a facade for creating + signing
	assetUtils.sign = sign;

	return assetUtils;
};