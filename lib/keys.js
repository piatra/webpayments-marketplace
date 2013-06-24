var payswarm = require('payswarm');
var user = require('./user.js');

var keyUtils = {
	createKeyPair : function (cb) {
		payswarm.createKeyPair({keySize: 2048}, function (err, pair){
			if (err) {
				console.log('Error : ', err);
			} else {
				var publicPem = pair.publicKey;
				var privatePem = pair.privateKey;
				cb(pair);
			}
		})
	},
	decode : function (encryptedMessage, email, cb) {
		user.getPrivateKey(email, function (err, privateKeyPem) {
			if (err) cb(err);
			else {
				payswarm.decrypt(encryptedMessage, {privateKey: privateKeyPem}, cb);
			}
		});
	}
}

module.exports = keyUtils;