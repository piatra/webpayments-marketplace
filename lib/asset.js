var _ = require('underscore'),
	fs = require('fs'),
	user = require('../lib/user')(),
	keys = require('../lib/keys')(),
	async = require('async'),
	utils = require('../lib/utils')(),
	payswarm = require('payswarm'),
	mongoose = require('mongoose'),
	db = require(__dirname + '/db.js'),
	host = require('../package.json').host
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

	function getOne (query, cb) {
		getOneAsset(query, function (asset) {
			getOneListing({'assetId': query['_id']}, function (listing) {
				var assetAndListing = {
					"@context": 'https://w3id.org/payswarm/v1',
					"@graph": [asset[0], listing[0]]
				}
				cb(assetAndListing);
			});
		});
	}

	function getOneAsset (query, cb) {
		db.get.asset(query, function (err, doc) {
			if (err) {
				console.log('Error getting one asset' + err);
				cb(err, {});
			} else {
				cb(null, doc);
			}
		});
	}

	function getOneListing (query, cb) {
		db.get.listing(query, function (err, doc) {
			if (err) {
				console.log('Error getting one listing' + err);
				cb({});
			} else {
				cb(doc);
			}
		});
	}

	function getUserAssets (query, cb) {
		db.get.userAssets(query, function (err, assets) {
			if (err) {
				console.log(err);
				cb({'error':err});
			} else {
				var docs = [];
				var l = assets.length;
				console.log('found' + l + 'assets for query',query);
				if(!l) cb(docs);
				assets.forEach(function (asset) {
					db.get.listing({'assetId':asset.listingId}, function (err, doc) {
						if (err) {
							console.log(err);
							cb({'error':err});
						} else {
							docs.push({
								asset: asset,
								listing: doc[0] // its just one el [doc]
							})
						}
						if (--l == 0) {
							cb(docs);
						}
					})
				})
			}
		})
	}

	function getListing (query, cb) {
		console.log('query', arguments);
		var errMsg = {'error': 'Listing not found'};
		db.get.listing(query, function (err, doc) {
			if (err || !doc.length) {
				console.log(err);
				cb(errMsg);
			} else {
				cb(doc[0] || errMsg);
			}
		});
	}

	function getAsset (query, cb) {
		var errMsg = {'error': 'Asset not found'};
		db.get.asset(query, function (err, doc) {
			if (err || !doc.length) {
				console.log(err);
				cb(errMsg);
			} else {
				cb(doc[0] || errMsg);
			}
		});
	}

	function updateAsset (query, fields, cb) {
		db.findOne.asset.update(query, fields, cb);
	}

	function updateListing (query, fields, cb) {
		db.findOne.listing.update(query, fields, cb);
	}

	function removeAll (query, cb) {
		db.findOneAndRemove.listing({
			assetId: query.id
		}, function (err) {
			if (err) cb(err);
			else {
				db.findOneAndRemove.asset({
					listingId: query.id
				}, cb);
			}
		})
	}

	// sign is a facade for creating + signing
	assetUtils.sign = sign;
	assetUtils.save = saveAssetAndListing;
	assetUtils.getUserAssets = getUserAssets;
	assetUtils.getOne = getOne;
	assetUtils.getListing = getListing;
	assetUtils.getAsset = getAsset;
	assetUtils.updateAsset = updateAsset;
	assetUtils.updateListing = updateListing;
	assetUtils.getOneListing = getOneListing;
	assetUtils.removeAll = removeAll;

	return assetUtils;
};