var _ = require('underscore'),
	fs = require('fs'),
	user = require('../lib/user')(),
	keys = require('../lib/keys')(),
	async = require('async'),
	utils = require('../lib/utils')(),
	payswarm = require('payswarm'),
	mongoose = require('mongoose'),
	db = require('../lib/db')
;

module.exports = function (options) {
	var assetUtils = {};

	function sign (req, cb) {
		createListing(req, function (err, signedListing, listingHash) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				createAsset(req, function (err, signedAsset, assetHash){
					if (err) {
						console.log(err);
						cb(err);
					} else {
						// set the asset to the listing
						signedListing.asset = signedAsset.id;
						signedListing.assetHash = assetHash;
						signedListing.licenseHash = listingHash;
						var assetAndListing = {
							"@context": 'https://w3id.org/payswarm/v1',
							"@graph": [signedAsset, signedListing]
						}
						cb(null, signedAsset, signedListing);
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

				req.body.validFrom = payswarm.w3cDate(new Date(req.body.validFrom));
				req.body.validUntil = payswarm.w3cDate(new Date(req.body.validUntil));

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
				createHash(signedAsset, function (err, hash) {
					if (err) {
						console.log(err);
						cb(err);
					} else {
						cb(null, signedAsset, hash);
					}
				})
			}
		});
	}

	// signedAsset
	// cb = function (err, assetHash)
	function createHash (signedItem, cb) {
		payswarm.hash(signedItem, function(err, assetHash) {
			if (err) {
				console.log('Error creating hash');
				console.log(err);
				cb(err);
			} else {
				cb(null, assetHash);
			}
		});
	}

	// graph = {asset, listing}
	// cb
	function saveAssetAndListing (graph, cb) {
		db.save.asset(graph, cb);
	}

	// sign is a facade for creating + signing
	assetUtils.sign = sign;
	assetUtils.save = saveAssetAndListing;

	return assetUtils;
};