var asset = require('../lib/asset')();
var keys = require('../lib/keys')();
var payswarm = require('payswarm');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var HOST = 'https://webpayments.fwd.wf';

var assets = {

	createAssetAndListing: function (req, res) {
		var assetId = new Date().getTime().toString(16);
		var k;
		async.waterfall([
		    function(callback) {
		      // read the config file from disk
		      keys.getKeyPair(function(err, keysPair) {
		        if(err) {
		          console.log('Error: Failed to find a PaySwarm configuration file.');
		          return callback(err);
		        }
		        k = JSON.parse(keysPair);
		        callback(null, k);
		      });
		    },
		    function(keysPair, callback) {
		      // Step #1: Create the asset and digitally sign it
		      console.log("Generating asset...");
		      var assetUrl = HOST + '/assets/asset/' + assetId;
		      var asset = {
		        '@context': payswarm.CONTEXT_URL,
		        id: assetUrl,
		        listingId: assetId,
		        type: ['Asset', 'pto:WebPage'],
		        creator: {
		          fullName: req.body.email,
		          userId: req.body.userId
		        },
		        title: req.body.title,
		        assetContent: assetUrl,
		        assetProvider: req.body.owner,
		        listingRestrictions: {
		          validFrom: payswarm.w3cDate(new Date(req.body.validFrom)),
		          validUntil: payswarm.w3cDate(new Date(req.body.validUntil)),
		          payee: [{
		            id: assetUrl + '/payee',
		            type: 'Payee',
		            destination: req.body.source,
		            currency: 'USD',
		            payeeGroup: ['assetProvider'],
		            destination: 'https://dev.payswarm.com/i/webpayments/accounts/incoming-payments',
		            payeeRate: '80',
		            payeeRateType: 'Percentage',
		            payeeApplyType: 'ApplyInclusively',
		            payeeApplyGroup: ['vendor'],
		            minimumAmount: '0.01',
		            comment: 'Asset Provider Royalty'
		          }],
		          payeeRule: [{
		            type: 'PayeeRule',
		            payeeGroupPrefix: ['authority']
		          }, {
		            type: 'PayeeRule',
		            payeeGroup: ['vendor'],
		            payeeRateType: 'FlatAmount',
		            payeeApplyType: 'ApplyExclusively'
		          }]
		        }
		      };

		      // sign the asset
		      payswarm.sign(asset, {
		        publicKeyId: keysPair.publicKey.id,
		        privateKeyPem: keysPair.publicKey.privateKeyPem
		      }, callback);
		    },
		    function(signedAsset, callback) {
		      // generate a hash for the signed asset
		      console.log("Signing asset...");
		      payswarm.hash(signedAsset, function(err, assetHash) {
		        callback(err, signedAsset, assetHash);
		      });
		    },
		    function(signedAsset, assetHash, callback) {
		      // Step #2: Create and digitally sign the listing
		      console.log('Generating and signing listing...');
		      var listingUrl = HOST + '/listings/listing/' + assetId;
		      var assetUrl = HOST + '/assets/asset/' + assetId;

		      var listing = {
		        '@context': payswarm.CONTEXT_URL,
		        id: listingUrl,
		        assetId: assetId,
		        type: ['Listing', 'gr:Offering'],
		        vendor: req.body.owner,
		        payee: [{
		          id: listingUrl + '/payee',
		          type: 'Payee',
		          destination: 'https://dev.payswarm.com/i/webpayments/accounts/incoming-payments',
		          currency: 'USD',
		          payeeGroup: ['vendor'],
		          payeeRate: req.body.price,
		          payeeRateType: 'FlatAmount',
		          payeeApplyType: 'ApplyExclusively',
		          comment: req.body.comment + ' [' + assetId + '].'
		        }],
		        payeeRule : [{
		          type: 'PayeeRule',
		          payeeGroupPrefix: ['authority'],
		          maximumPayeeRate: '10',
		          payeeRateType: 'Percentage',
		          payeeApplyType: 'ApplyInclusively'
		        }],
		        asset: assetUrl,
		        assetHash: assetHash,
		        license: 'https://w3id.org/payswarm/licenses/blogging',
		        licenseHash: 'urn:sha256:' +
		          'd9dcfb7b3ba057df52b99f777747e8fe0fc598a3bb364e3d3eb529f90d58e1b9',
		        validFrom: payswarm.w3cDate(new Date(req.body.validFrom)),
		        validUntil: payswarm.w3cDate(new Date(req.body.validUntil))
		      };

		      // sign the listing
		      payswarm.sign(listing, {
		        publicKeyId: k.publicKey.id,
		        privateKeyPem: k.publicKey.privateKeyPem
		      }, function(err, signedListing) {
		        callback(err, signedAsset, signedListing);
		      });
		    },
		    function(signedAsset, signedListing, callback) {
		      // Step #3: Register the signed asset and listing
		      console.log("Register signed asset and listing...");
		      var assetAndListing = {
		        '@context': payswarm.CONTEXT_URL,
		        '@graph': [signedAsset, signedListing]
		      };

		      console.log(JSON.stringify(assetAndListing, null, 2));

		      fs.writeFile(__dirname + '/assets/' + assetId, JSON.stringify(assetAndListing, null, 2), function (err) {
		      	if (err) {
		      		console.log(err);
		      	} else {
			      asset.save(assetAndListing, function(err, result) {
			        callback(err, assetAndListing);
			      });
		      	}
		      })
		    },
		    function(assetAndListing, callback) {
		      // display registration details
		      var debug = 0;
		      if(debug) {
		        console.log('Registered signed asset and listing: ' +
		          JSON.stringify(assetAndListing, null, 2));
		      }
		      else {
		        console.log('Registered signed asset:\n   ',
		          assetAndListing['@graph'][0].id);
		        console.log('Registered signed listing:\n   ',
		          assetAndListing['@graph'][1].id);
		      }
		      callback(null);
		    }
		  ], function(err) {
		    if(err) {
		      console.log('Failed to register signed asset and listing:',
		        err.toString());
		    } else {
		    	res.json({
		    		'error' : null,
		    		'message': 'Asset and listing created successfully'
		    	});
		    }
		  });
	},

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
			keys.getKeyPair(function(err, k) {
				k = JSON.parse(k);
				fs.readFile(__dirname + '/assets/' + req.params.id, function (err, data) {
					json = JSON.parse(data);
					payswarm.purchase(json['@graph'][1], {
						transactionService: 'https://dev.payswarm.com/transactions',
						customer: req.session.identity,
						source: req.session.identity,
						privateKeyPem: k.publicKey.privateKeyPem,
						publicKey: 'https://dev.payswarm.com/i/webpayments/keys/3',
						verbose: true
					}, function(err, receipt) {
						if (err) {
							console.log(JSON.stringify(err, null,2));
						} else {
							console.log('Receipt:', receipt);
							console.log('Transaction ID:', receipt.contract.id);
						}
					});

				})
			})

		}

	},

	getListing: function (req, res) {
		// fs.readFile(__dirname + '/assets/' + req.params.id, function (err, data) {
		// 	data = JSON.parse(data);
		// 	res.json(data['@graph'][1]);
		// });
		var query = {'assetId': req.params.id};
		asset.getListing(query, function (doc) {
			res.json(doc);
		});
	},

	getAsset: function (req, res) {
		// fs.readFile(__dirname + '/assets/' + req.params.id, function (err, data) {
		// 	data = JSON.parse(data);
		// 	res.json(data['@graph'][0]);
		// });
		var query = {'listingId': req.params.id};
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

	resignListing: function (req, res) {
		var query = {'_id' : req.params.id};
		asset.getListing(query, function (doc) {
			keys.getKeyPair(function (err, keys) {
				var keys = JSON.parse(keys);
				doc.signature = {};
				var listing = {
		        '@context': payswarm.CONTEXT_URL,
		        id: doc.id,
		        type: ['Listing', 'gr:Offering'],
		        vendor: doc.vendor,
		        payee: doc.payee,
		        payeeRule : doc.payeeRule,
		        asset: doc.asset,
		        assetHash: doc.assetHash,
		        license: 'https://w3id.org/payswarm/licenses/blogging',
		        licenseHash: 'urn:sha256:' +
		          'd9dcfb7b3ba057df52b99f777747e8fe0fc598a3bb364e3d3eb529f90d58e1b9',
		        validFrom: doc.validFrom,
		        validUntil: doc.validUntil
		      };
				payswarm.sign(listing, {
						publicKeyId: keys.publicKey.id,
						privateKeyPem: keys.publicKey.privateKeyPem
					}, function(err, signedListing) {
						console.log(err, signedListing);
				});
			})
		});
	},

	getUserAssets: function (req, res) {
		var query = { email: req.session.email };
		console.log(query);
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