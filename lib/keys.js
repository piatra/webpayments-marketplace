var keyUtils = {
	createKeyPair : function (cb) {
		var payswarm = require('payswarm');
		payswarm.createKeyPair({keySize: 2048}, function (err, pair){
			if (err) {
				console.log('Error : ', err);
			} else {
				var publicPem = pair.publicKey;
				var privatePem = pair.privateKey;
				cb(pair);
			}
		})
	}
}

module.exports = keyUtils;