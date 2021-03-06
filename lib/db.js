var mongoose = require('mongoose');
var _ = require('underscore');

if (process.env.NODE_ENV)
	var db = mongoose.connect('mongodb://nodejitsu:c0a886dafe2c7d59cfc1d0d62e61ebff@dharma.mongohq.com:10074/nodejitsudb4747069906');
else {
	console.log('-----------');
	console.log('process.env.NODE_ENV not found.');
	console.log('Default DB connection to localhost');
	console.log("Set it by using `$ export NODE_ENV='production'`");
	var db = mongoose.connect('mongodb://localhost:27017/webpay');
}

var schemas = require('./schemas')(db);

function assert() {
	argv = _.toArray(arguments);
	if(!argv[0]) {
		console.log(argv[2]);
		throw new Error('Expected ' + argv[1] + ' to be defined');
	}
}

var dbUtils = {
	find: function (schema, query, fields, cb) {
		if (typeof fields === 'function') {
			cb = fields;
			fields = {};
		}
		schema.find(query, fields, cb);
	},
	next: function (cb) {
		return function (err, doc) {
			if (err) {
				console.log(err);
				cb(err);
			} else {
				cb(null, doc);
			}
		}
	},
	save : {
		asset: function (assetAndListing, cb) {

			console.log(arguments);

			var asset = new schemas.Asset(assetAndListing['@graph'][0]);
			var listing = new schemas.Listing(assetAndListing['@graph'][1]);

			asset.save(function (err) {
				console.log('asset err', err);
				if (err) {
					cb(err);
				} else {
					listing.save(function (err) {
						console.log('listing err', err);
						if (err) {
							cb(err);
						} else {
							cb(null);
						}
					})
				}
			})
		}
	},
	listing: {
		update: function (listing, query, cb) {
			schemas.Listing.update(listing, query, cb);
		}
	},
	findOneAndRemove: {
		listing : function (query, cb) {
			schemas.Listing.findOneAndRemove(query, cb);
		},
		asset: function (query, cb) {
			schemas.Asset.findOneAndRemove(query, cb);
		}
	},
	findOne: {
		user : function (query, cb) {
			console.log('finding one user', query);
			// dbUtils.create.user(query, cb);
			schemas.User.findOne(query, cb);
		},
		asset: {
			update: function (asset, query, cb) {
				schemas.Asset.findOneAndUpdate(asset, query, cb);
			}
		},
		listing: {
			update: function (listing, query, cb) {
				schemas.Listing.findOneAndUpdate(listing, query, cb);
			}
		}
	},
	create: {
		user: function (query, cb) {
			var user = new schemas.User(query);
			user.save(cb);
		}
	},
	findOneAndUpdate : function (user, query, cb) {
		schemas.User.findOneAndUpdate(user, query, cb);
	},
	get : {
		user: function (fields, user, cb) {
			schemas.User.findOne(user, fields, dbUtils.next(cb));
		},
		asset: function (query, cb) {
			schemas.Asset.find(query, dbUtils.next(cb));
		},
		listing: function (query, cb) {
			schemas.Listing.find(query, dbUtils.next(cb));
		},
		userAssets: function (query, cb) {
			schemas.Asset.find(query, dbUtils.next(cb));
		},
		userListings: function (id, cb) {
			dbUtils.find(schemas.Listing, {assetId: id}, dbUtils.next(cb));
		}
	}
}

module.exports = dbUtils;