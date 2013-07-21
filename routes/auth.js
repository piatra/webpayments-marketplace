
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

		var audience = 'audience=';
		audience += process.env.NODE_ENV ? 'http://webpayments.jit.su' : 'http://localhost:3000';
		audience += '&assertion=' + req.body.assertion;

		var headers = {
			headers: {
				'content-type' : 'application/x-www-form-urlencoded'
			},
			url: 'https://verifier.login.persona.org/verify',
			body: audience
		};

		request.post(
			headers,
			function(err, response, body){
				if (!err && response.statusCode == 200 ) {
					body = JSON.parse(body);
					if (body.status == 'okay') {
						user.checkUser(body, function (user) {

							if (!user) body.registered = false;
							else body.registered = user.registered;

							keys.getKeyPair(function (err, keyPair) {
								if (err) {
									console.log(err);
									res.json({
										message: 'An error has occured ' + err,
										error: true
									});
								} else {
									auth.returnKeys(req, res, body, keyPair);
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

	returnKeys: function (req, res, body, keyPair) {
		keyPair = JSON.parse(keyPair);
		console.log('keys', keyPair);
		body.publicKey = keyPair.publicKey.publicKeyPem;
		req.session.email = body.email;
		user.get({owner: 1, username: 1}, {email: body.email}, function (err, doc) {
			if (err) {
				console.log(err);
			} else {
				console.log('auth doc', doc);
				req.session.userid = doc['_id'];
				req.session.identity = doc.owner;
				req.session.username = doc.username;
				console.log('body', body);
				console.log('doc', doc);
				res.json(body);
			}
		})
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
				console.log('registrationUrl', registrationUrl);
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