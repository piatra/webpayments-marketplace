
/*
 * auth module
 * @ndreio
 */

var request = require('request');
var mongoose = require('mongoose');
var user = require('../lib/user.js')();
var payswarm = require('payswarm');
var async = require('async');
var URL = require('url');
var keys = require('../lib/keys')();

var auth = {

	verify : function (req, res) {

		request.post({
			headers: {
				'content-type' : 'application/x-www-form-urlencoded'
			},
			url:     'https://verifier.login.persona.org/verify',
			body:    'audience=http://localhost:3000&assertion=' + req.body.assertion
			},
			function(err, response, body){
				if (!err && response.statusCode == 200 ) {
					body = JSON.parse(body);
					if (body.status == 'okay') {
						console.log(user);
						user.checkUser(body, function (user) {
							body.registered = user.registered;
							keys.getKeyPair(function (err, keyPair) {
								if (err) {
									console.log(err);
									res.json({message: 'An error has occured ' + err, error:true});
								} else {
									keyPair = JSON.parse(keyPair);
									body.publicKey = keyPair.publicKey.publicKeyPem;
									req.session.email = body.email;
									res.json(body);
								}
							});
						});
					} else {
						res.json(body);
					}
				}
			}
		);

	},

	registerKey : function (req, res) {
		async.waterfall([
			function(callback) {
				payswarm.getWebKeysConfig('dev.payswarm.com', callback);
			}, function(endpoints, callback) {
				var registrationUrl = URL.parse(endpoints.publicKeyService, true, true);
				registrationUrl.query['public-key'] = req.body.publicKey;
				registrationUrl.query['response-nonce'] = new Date().getTime().toString(16);
				delete registrationUrl.search;
				registrationUrl = URL.format(registrationUrl);
				callback(null, registrationUrl)
			},
			function(registrationUrl, callback) {
				res.end(registrationUrl);
			}
		], function (err, result) {
			console.log(err);
			res.end();
		});
	},

	complatePayswarmRegistration : function (req, res) {
		try {
			var paysw = JSON.parse(req.body.payswarm_response);
		} catch (e) {
			console.log(e);
		}
		keys.decode(paysw, function (err, message) {
			if (err) {
				showError(err, res);
			} else {
				var fields = {
					publicKeyUrl : message.publicKey,
					owner : message.owner,
					destination : message.destination,
					registered : true
				}
				user.updateFields(fields, {email : req.body.email}, function () {
					status(err, res);
				})
			}
		});
	}

};

function showError (err, res) {
	res.render('status', {
		title : 'An error has ocurred',
		message : err
	});
}

function status (err, res) {
	if (err) {
		showError(err, res);
	} else {
		res.render('status', {
			title : 'Done',
			message : 'Action completed succesfully'
		});
	}
}

module.exports = auth;