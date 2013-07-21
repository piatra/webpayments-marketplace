var asset = require('../lib/asset')();
var keys = require('../lib/keys')();
var payswarm = require('payswarm');
var fs = require('fs');
var host = 'webpayments.fwd.wf';

var assets = {
	processAsset : function (req, res) {

		asset.sign(req, function (err, asset, listing) {
			if (err) {
				console.log(err.details.cause.details);
				res.render('status', {
					title: 'An error has occured',
					message: err.message
				});
			} else {
				res.json({
					asset: asset,
					listing: listing
				});
			}
		});
	},

	saveAsset: function (req, res) {
		if (!req.body.asset) {
			res.end();
		}
		asset.save({
			asset: req.body.asset,
			listing: req.body.listing
		}, function (err) {
			if (err) {
				console.log(err);
				res.json({
					err: err
				});
			} else {
				res.json({
					href: '/'
				});
			}
		});
	},

	purchase: function (req, res) {
		// this is a big FIXME
		if (!req.session.identity) res.end('not logged in ');
		else {
			asset.getOneListing({'assetId' : req.params.id}, function (listing) {
				keys.getKeyPair(function (err, keys) {
					if (err) {
						console.log('error reading keys while making purchase');
						res.end('error');
					} else {
						keys = JSON.parse(keys);
						listing = listing[0];
						listing["@context"] = "https://w3id.org/payswarm/v1";
						fs.readFile(__dirname + '/../lib/listing.simple.cfg', 'utf8', function (err, data) {
							json = JSON.parse(data);
							var listing2 = {};
							for (var i in json) {
								listing2[i] = listing[i];
							}
							//FIXME
							listing2.asset = 'http://'+host+'/assets/asset/' + listing.assetId;
							listing2.id = 'http://'+host+'/listings/listing/' + listing['_id'];
							payswarm.purchase(listing2, {
								transactionService: 'https://dev.payswarm.com/transactions',
								customer: req.session.identity,
								source: req.session.identity,
								privateKeyPem: keys.publicKey.privateKeyPem,
								publicKey: keys.publicKey.id,
								verbose: true
							}, function(err, receipt) {
								if (err) {
									console.log(JSON.stringify(err, null,2));
									res.json([listing2,keys.publicKey.privateKeyPem,keys.publicKey.id,req.session.identity]);
								} else {
									console.log('Receipt:', receipt);
									console.log('Transaction ID:', receipt.contract.id);
								}
							});
						})
					}
				})

			});

		}

	},

	getListing: function (req, res) {
		var query = {'_id': req.params.id};
		asset.getListing(query, function (doc) {
			res.json(doc);
		});
	},

	getAsset: function (req, res) {
		var query = {'_id': req.params.id};
		asset.getAsset(query, function (doc) {
			res.json(doc);
		});
	},

	decrypt: function (req, res) {
		var type = req.params.type,
			query = {'_id': req.params.id}
		;
		if (type == 'asset') {
			asset.getAsset(query, function (doc) {
				keys.getKeyPair(function (err, keys) {
					var json = JSON.parse(keys);
					payswarm.decrypt(doc, {privateKey: json.publicKey.privateKeyPem}, function (err, resp){
						res.json({
							err: err,
							res: resp
						})
					});
				});
			});
		}
		if (type == 'listing') {
			asset.getListing(query, function (doc) {
				keys.getKeyPair(function (err, keys) {
					var json = JSON.parse(keys);
					payswarm.decrypt(doc, {privateKey: json.publicKey.privateKeyPem}, function (err, resp){
						res.json({
							err: err,
							res: resp
						})
					});
				})
			});
		}
	},

	getUserAssets: function (req, res) {
		var query = { email: req.session.email };
		asset.getUserAssets(query, function (assets) {
			res.json(assets);
		});
	},

	getLatestAssets: function (req, res) {
		asset.getUserAssets({}, function (assets) {
			res.json(assets);
		});
	}
};

module.exports = assets;