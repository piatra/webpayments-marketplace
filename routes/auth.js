
/*
 * auth module
 * @ndreio
 */

var request = require('request');
var mongoose = require('mongoose');
var user = require('../lib/user.js');
var payswarm = require('payswarm');
var async = require('async');
var URL = require('url');

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
				registrationUrl.query['public-key'] = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy7RGr25M1RXOndi8Rkcl\neK0nNW+WMB5NE7HwJsWXbWAzRS8TvBUjHO08HzJ++X2HmPlhGARA4REqgVyx88Tn\nlwzzSC+RQ6A1RrJiT1PTlcYmfzwaCVCQrwyle9Ui30AjQ2Cz9juRlqBrF5sMBPPA\nL9wHBDMhATXUmShbvV7wHRF3j87K8K6m5zLV0zBZQw0skSwYjXoT7/95aUF9cl4b\n12VlmE0BGvxHIx4gRSMO1NN2XgoF37WvxgQqDiuu2rbHW4EkHUY2z3+rOIQrG7IQ\nuyKO5f37GfO/LKoI3h4Ik+CfCTMBh1Rt1RxP3bt/WwQjtLzta7GvSWdKwnFqtGTe\noQIDAQAB\n-----END PUBLIC KEY-----\n";
				registrationUrl.query['response-nonce'] = new Date().getTime().toString(16);
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