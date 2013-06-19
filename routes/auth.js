
/*
 * auth module
 * @ndreio
 */

var request = require('request');
var mongoose = require('mongoose');
var user = require('../lib/user.js');

auth = {

	verify : function (req, res) {
		var data = {
			assertion: req.body.assertion,
			audience: 'http://localhost:3000'
		};

		request.post({
			headers: {
				'content-type' : 'application/x-www-form-urlencoded'
			},
			url:     'https://verifier.login.persona.org/verify',
			body:    'audience=http://localhost:3000&assertion=' + req.body.assertion
			},
			function(err, response, body){
				console.log(err, response, body);
				if (!err && response.statusCode == 200 ) {
					body = JSON.parse(body);
					if (body.status == 'okay') {
						console.log('user status ok');
						user.checkUser(body, function () {
							res.json(body);
						});
					} else {
						res.json(body);
					}
				}
			}
		);

	},

	registerKey : function () {
		async.waterfall([
			function(callback) {
				payswarm.getWebKeysConfig('dev.payswarm.com', callback);
			}, function(endpoints, callback) {
				var registrationUrl = URL.parse(endpoints.publicKeyService, true, true);
				registrationUrl.query['public-key'] = publicKeyPem;
				registrationUrl.query['response-nonce'] =
				new Date().getTime().toString(16);
				delete registrationUrl.search;
				registrationUrl = URL.format(registrationUrl);
				callback(null, registrationUrl)
			},
			function(registrationUrl, callback) {
				console.log('Register your key here: ', registrationUrl);
			}
		], function (err, result) {
			console.log(err);
			console.log(result);
		});
	}

};

module.exports = auth;