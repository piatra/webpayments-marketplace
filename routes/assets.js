var asset = require('../lib/asset')();
var keys = require('../lib/keys')();
var payswarm = require('payswarm');
var request = require('request');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var user = require('../lib/user')();
var HOST = require('../package.json').host;

var assets = {

	createAssetAndListing: function (req, res) {
		var assetId = new Date().getTime().toString(16);
		var k;
		async.waterfall([
			function (callback) {
				console.log('getting & writing files');
				var l = req.files.files.length;
				if (!_.isArray(req.files.files)) {
					req.files.files = [req.files.files];
					l = 1;
				}
				req.files.files.forEach(function (file) {
					fs.readFile(file.path, function (err, data) {
						var newPath = __dirname + "/../public/uploads/" + assetId + '_' + file.name;
						fs.writeFile(newPath, data, function (err) {
							console.log('done writing', err);
							if (err) {
								console.log('an error occured');
								callback(err);
							} else {
								if (--l == 0)
									callback(null);
							}
						});
					});
				});
			},
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
		        assetContent: assetUrl + '/content',
		        assetFiles: req.files.files.map(function (f) { return f.name }),
		        assetProvider: 'https://dev.payswarm.com/i/webpay',
		        listingRestrictions: {
		          validFrom: payswarm.w3cDate(new Date(req.body.validFrom)),
		          validUntil: payswarm.w3cDate(new Date(req.body.validUntil)),
		          payee: [{
		            id: assetUrl + '/payee',
		            type: 'Payee',
		            destination: req.body.source,
		            currency: 'USD',
		            payeeGroup: ['assetProvider'],
		            destination: 'https://dev.payswarm.com/i/webpay/accounts/primary',
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
		        vendor: 'https://dev.payswarm.com/i/webpay',
		        payee: [{
		          id: listingUrl + '/payee',
		          type: 'Payee',
		          destination: 'https://dev.payswarm.com/i/webpay/accounts/primary',
		          currency: 'USD',
		          payeeGroup: ['vendor'],
		          payeeRate: req.body.price,
		          payeeRateType: 'FlatAmount',
		          payeeApplyType: 'ApplyExclusively',
		          comment: req.body.comment
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

		      asset.save(assetAndListing, function(err, result) {
		        callback(err, assetAndListing);
		      });
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
		    	res.render('preview-selection.jade', {
		    		'title': 'WebPayments Marketplace',
		    		'files': req.files.files,
		    		'id': assetId
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

	prepareFiles: function(zipfile, res, name) {
		return function (files, cb) {
			if (files && files.length) {
				zipfile.addFile(__dirname + '/../public/uploads/' + files[0], files[0], function (err) {
					if (err) {
						console.log(err);
						res.end();
					} else {
						cb(_.rest(files), cb);
					}
				})
			} else {
				fs.createReadStream(name).pipe(res);
			}
		}
	},

	getAssetContent: function (id, req, res) {
		var query = {'listingId': id};
		asset.getAsset(query, function (doc) {
			var zipper = require('zipper').Zipper;
			var name = Date.now() + '.zip';
			var zipfile = new zipper(name);
			var files = [];

			doc.assetFiles.forEach(function (file) {
				files.push(doc.listingId + '_' + file);
			});

			var fn = assets.prepareFiles(zipfile, res, name);
			fn(files, fn);

		});
	},

	purchase: function (req, res) {
		// this is a big FIXME
		var id = req.params.id;
		var authority = 'https://dev.payswarm.com/';
		// if user purchased asset
		console.log('getting user');
		user.get({purchases:1,preferences:1}, {owner:req.session.identity || 'https://dev.payswarm.com/i/piatra'}, function (err, docs) {
			console.log(docs, 'for', {owner:req.session.identity});
			if (err) {
				console.log(err);
				res.end('Error!');
			} else {
				// show the asset page
				if (docs.purchases && ~docs.purchases.indexOf(id)) {
					assets.getAssetContent(id, req, res);
				// else redirect
				} else {
					if (docs.preferences.hasBudget) {
						// get the money from the budget he has set up
						request.get({url : HOST + '/listings/listing/' + id, json: true}, function (err, resp, listing) {
							keys.getKeyPair(function (err, data) {
								if (err) {
									res.end('error reading keys');
									console.log(err);
								} else {
									data = JSON.parse(data);
									payswarm.purchase(listing, {
										transactionService: authority + 'transactions',
										customer: req.session.identity,
										publicKey: data.publicKey.id,
										privateKeyPem: data.publicKey.privateKeyPem,
										verbose: true
									}, function (err, receipt){
										if (err) {
											console.log('Error making purchase ', err);
											res.json(err);
										} else {
											assets.inAppPurchased(req, res, receipt);
										}
									});
								}
							});
						})
					} else {
						// take him to the payswarm website
						assets._purchaseRedirect (req, res, function (err, url) {
							if (err) {
								res.end();
							} else {
								console.log('redirect', url);
								res.redirect(url);
							}
						});
					}
				}
			}
		})
	},

	/*
		purchase via purchase URL
		like recipes.payswarm.com
	*/
	_purchaseRedirect: function (req, res, cb) {
		var id = req.params.id;
		
		request.get({url: HOST +'/listings/listing/' + id, json: true}, function (err, response, body){

			res.cookie('purchasedAsset', id);
			res.cookie('userId', req.session.userid);

			payswarm.hash(body, function (err, hash) {
				if (err) {
					console.log(JSON.stringify(err, null, 2));
					cb (err);
					console.log(body);
				} else {
					console.log('no error making purchase');
					var url = 'https://dev.payswarm.com/profile/login?ref=/transactions?form=pay';
					url += encodeURIComponent('&listing=' + HOST + '/listings/listing/' + id);
					url += encodeURIComponent('&listing-hash=' + hash);
					url += encodeURIComponent('&callback=' + HOST + '/assets/asset/purchased');
					url += encodeURIComponent('&response-nonce=12345678');
					cb(null, url);
				}
			})
		});
	},

	getListing: function (req, res) {
		var query = {'assetId': req.params.id};
		asset.getListing(query, function (doc) {
			res.json(doc);
		});
	},

	getAsset: function (req, res) {
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

	purchased: function (req, res) {
		req.body = JSON.stringify(req.body, null, 2);
		body = JSON.parse(req.body);
		body = JSON.parse(body['encrypted-message']);

		keys.decode(body, function (err, resp){
			if (err) {
				console.log(err);
				res.end('Error!');
			} else {
				if (~resp.preferences.indexOf('PreAuthorization')) {
					async.waterfall([
						function (callback) {
							user.get({preferences:1}, {_id: req.cookies.userId }, function (err, doc) {
								console.log(doc);
								if (err) {
									callback(err);
								} else {
									// res.json(resp);
									doc.preferences.hasBudget = true;
									doc.save(function(err){
										if (err) callback(err);
										else callback(null);
									})
								}
							});
						},
						function (callback) {
							user.addPurchase(
								req.cookies.purchasedAsset,
								{ _id: req.cookies.userId },
								function (err) {
									if (err) callback(err);
									else callback(null);
								}
							);
						}], assets._cb(function(){
							assets.getAssetContent(req.cookies.purchasedAsset, req, res);
						})
						);
				} else {
					user.addPurchase(
						req.cookies.purchasedAsset,
						{ _id: req.cookies.userId },
						assets._cb(function(){
							assets.getAssetContent(req.cookies.purchasedAsset, req, res);
						})
					);
				}
			}
		})
	},

	inAppPurchased: function (req, res, receipt) {
		if (!receipt || !Object.keys(receipt).length)
			throw new Error('no receipt received');

		var arr = receipt.contract.asset.split('/');
		user.addPurchase(
			arr[arr.length-1],
			{ _id: query.id },
			assets._cb(function(){
				assets.getAssetContent(arr[arr.length-1], req, res);
			})
		);
	},

	_cb: function (cb) {
		return function (err) {
			if (err) {
				// FIXME
				// actual error handling
				console.log('an error has occured', err);
				res.end('Error');
			} else {
				cb();
			}
		}
	},

	getUserAssets: function (req, res) {
		var query = { email: req.session.email };
		console.log(query);
		asset.getUserAssets(query, function (assets) {
			res.json(assets);
		});
	},

	preview: function (req, res) {
		asset.getAsset({listingId: req.params.id}, function (doc) {
			if (doc.error)
				res.end('Asset not found');
			else {
				doc.assetPreview = req.body.preview;
				doc.save(function (err) {
					if (err) {
						res.end('An error has occured');
					} else {
						res.redirect('/');
					}
				})
			}
		})
	},

	myAssets: function (req, res) {
		var query = { 'creator.userId': req.cookies.userID };
		asset.getUserAssets(query, function (assets) {
			res.render('account-assets', {
				assets: assets,
				user: req.session.email
			})
		});
	},

	delete: function (req, res) {
		var id = req.params.id;
		asset.removeAll({
			id: id
		}, function (err) {
			if (err) {
				res.json(err);
			} else {
				res.redirect('/account/assets');
			}
		})
	},

	edit: function (req, res) {
		asset.getAsset({listingId: req.body.id}, function (doc) {
			if (doc.error)
				res.end('Asset not found');
			else {
				asset.getListing({ assetId: doc.listingId }, function (listing) {
					if (listing.error)
						res.end('Asset not found');
					else {
						console.log(listing);
						res.render('asset-edit', {
							asset: doc,
							listing: listing,
							user: req.session.email
						});
					}
				})
			}
		})
	},

	update: function (req, res) {

		var k;

		async.waterfall([
			function (callback) {
				asset.get({
					asset: true
				}, {
					_id: req.body.assetId
				}, callback);
			},
			function (_asset, callback) {
				asset.get({
					listing: true
				}, {
					_id: req.body.listingId
				}, function (err, doc) {
					callback(err, _asset, doc);
				});
			},
		    function (_asset, _listing, callback) {
		      // read the config file from disk
		      keys.getKeyPair(function(err, keysPair) {
		        if(err) {
		          console.log('Error: Failed to find a PaySwarm configuration file.');
		          return callback(err);
		        }
		        k = JSON.parse(keysPair);
		        callback(null, _asset, _listing, k);
		      });
		    },
		    function(_asset, _listing, keysPair, callback) {
		      // Step #1: Create the asset and digitally sign it
		      console.log("Generating asset...");
		      var assetUrl = HOST + '/assets/asset/' + _asset.listingId;
		      var asset = {
		        '@context': payswarm.CONTEXT_URL,
		        id: assetUrl,
		        listingId: _asset.listingId,
		        type: ['Asset', 'pto:WebPage'],
		        creator: _asset.creator,
		        title: req.body.title,
		        assetContent: assetUrl + '/content',
		        assetFiles: _asset.assetFiles,
		        assetProvider: 'https://dev.payswarm.com/i/webpay',
		        listingRestrictions: {
		          validFrom: _asset.listingRestrictions.validFrom,
		          validUntil: _asset.listingRestrictions.validUntil,
		          payee: [{
		            id: assetUrl + '/payee',
		            type: 'Payee',
		            destination: _asset.listingRestrictions.payee[0].destination,
		            currency: 'USD',
		            payeeGroup: ['assetProvider'],
		            destination: 'https://dev.payswarm.com/i/webpay/accounts/primary',
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
		      asset = JSON.parse(JSON.stringify(asset));
		      console.log(asset);
		      payswarm.sign(asset, {
		        publicKeyId: keysPair.publicKey.id,
		        privateKeyPem: keysPair.publicKey.privateKeyPem
		      }, function (err, signedAsset) {
		      	console.log('signed asset');
		      	callback(err, signedAsset, _listing);
		      });
		    },
		    function(signedAsset, _listing, callback) {
		      // generate a hash for the signed asset
		      console.log("Signing asset...");
		      payswarm.hash(signedAsset, function(err, assetHash) {
		        callback(err, signedAsset, assetHash, _listing);
		      });
		    },
		    function(signedAsset, assetHash, _listing, callback) {
		      // Step #2: Create and digitally sign the listing
		      console.log('generating listing');
		      console.log('Generating and signing listing...');
		      var listingUrl = HOST + '/listings/listing/' + _listing.assetId;
		      var assetUrl = HOST + '/assets/asset/' + _listing.assetId;

		      var listing = {
		        '@context': payswarm.CONTEXT_URL,
		        id: listingUrl,
		        assetId: _listing.assetId,
		        type: ['Listing', 'gr:Offering'],
		        vendor: 'https://dev.payswarm.com/i/webpay',
		        payee: [{
		          id: listingUrl + '/payee',
		          type: 'Payee',
		          destination: 'https://dev.payswarm.com/i/webpay/accounts/primary',
		          currency: 'USD',
		          payeeGroup: ['vendor'],
		          payeeRate: req.body.price,
		          payeeRateType: 'FlatAmount',
		          payeeApplyType: 'ApplyExclusively',
		          comment: req.body.comment
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
		        validFrom: _listing.validFrom,
		        validUntil: _listing.validUntil
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

		      asset.removeAll({id: signedAsset.listingId}, function (err) {
		      	if (err) {
		      		console.log(err);
		      		throw new Error('could not remove docs');
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
		    	res.redirect('/account/assets');
		    }
		  });

	},

	getLatestAssets: function (req, res) {
		asset.getUserAssets({}, function (assets) {
			res.json(assets);
		});
	}
};

function assert (value, msg) {
	if (!value) throw new Error(msg);
}

module.exports = assets;