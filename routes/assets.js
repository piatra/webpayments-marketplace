var assets = {
	processAsset : function (req, res) {
		var asset = require('../lib/asset')();
		asset.sign(req, function (err, signedListing, signedAsset) {
			if (err) {
				console.log(err.details.cause.details);
				res.render('status', {
					title: 'An error has occured',
					message: err.message
				})
			} else {
				res.json({
					listing: signedListing,
					asset: signedAsset
				})
			}
		})
	}
};

module.exports = assets;