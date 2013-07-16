var asset = require('../lib/asset')();

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

	getUserAssets: function (req, res) {
		var query = { email: req.session.email };
		console.log('query', query, 'getUserAssets');
		asset.getUserAssets(query, function (assets) {
			console.log('got assets', assets);
			res.json(assets);
		});
	},

	getLatestAssets: function (req, res) {
		console.log('limit', req.params.count);
		asset.getUserAssets({}, function (assets) {
			console.log('getlatestassets', assets);
			res.json(assets);
		});
	}
};

module.exports = assets;