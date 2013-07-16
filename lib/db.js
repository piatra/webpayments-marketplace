var mongoose = require('mongoose');

if (process.env.NODE_ENV)
	var db = mongoose.connect('mongodb://nodejitsu:c0a886dafe2c7d59cfc1d0d62e61ebff@dharma.mongohq.com:10074/nodejitsudb4747069906');
else
	var db = mongoose.connect('mongodb://localhost:27017/webpayments');

var schemas = require('./schemas')(db);

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
		asset : function (graph, cb) {
			var listing = new schemas.Listing(graph.listing);
			console.log(graph.asset);
			var asset = new schemas.Asset(graph.asset);

			asset.save(function (err, d) {
				if (err) cb(err);
				else {
					listing.assetId = d['_id'];
					listing.save(function (err) {
						if (err) cb(err);
						else cb(null);
					})
				}
			});
		}
	},
	findOne: {
		user : function (query, cb) {
			schemas.User.findOne(query, function (err, docs) {
				if (!docs) {
					dbUtils.create.user(query, cb);
				} else {
					cb(docs);
				}
			});
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
		userAssets: function (query, cb) {
			dbUtils.get.user({
				owner: 1
			}, query, function (err, doc) {
				if (err) {
					console.log(err);
					cb(err);
				} else {
					console.log(doc);
					console.log(query);
					schemas.Asset.find({
						assetProvider: doc.owner
					}, dbUtils.next(cb));
				}
			})
		},
		userListings: function (id, cb) {
			dbUtils.find(schemas.Listing, {assetId: id}, dbUtils.next(cb));
		}
	}
}

module.exports = dbUtils;