var payswarm = require('payswarm'),
	fs = require('fs'),
	user = require('./user.js')
;

module.exports = function(opts) {

	var keys = {};

	function getKeyPair (cb) {
		fs.readFile('./lib/payswarm.cfg', 'utf8', cb);
	}

	function decode (encryptedMessage, cb) {
		getKeyPair(function (err, data) {
			if (err) {
				console.log('Error reading keys: ', err);
			} else {
				keyPair = JSON.parse(data);
				payswarm.decrypt(encryptedMessage, {privateKey: keyPair.publicKey.privateKeyPem}, cb);
			}
		});
	}

	function sign (asset, cb) {
		getKeyPair(function (err, data) {
			if (err) {
				cb(err);
			} else {
				data = JSON.parse(data);
				payswarm.sign(asset, {
					publicKeyId: data.publicKey.id,
					privateKeyPem:data.publicKey.privateKeyPem
				}, function (err, signedAsset) {
					if (err) cb(err);
					else cb(null, signedAsset);
				})
			}
		})
	}

	keys.getKeyPair = getKeyPair;
	keys.decode = decode;
	keys.sign = sign;
	return keys;
};