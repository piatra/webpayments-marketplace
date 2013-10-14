
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
var HOST = require('../package.json').host;
var _ = require('underscore');

var crypto = require('crypto');

function md5 (string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

var auth = {

	verify : function (req, res) {

		var audience = 'audience=';
		audience += HOST;
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
						user.checkUser(body, function (err, user) {

							if (err) {
								res.end('Error creating user');
							} else {
								console.log('found ', user);
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
							}

						});
					} else {
						res.json(body);
					}
				}
			}
		);

	},

	payswarmVerify: function (req, res) {
		user.checkUser(req.body, function (user) {
			res.json({
				registered: user.registered
			})
		})
	},

	returnKeys: function (req, res, body, keyPair) {
		keyPair = JSON.parse(keyPair);
		body.publicKey = keyPair.publicKey.publicKeyPem;
		req.session.email = body.email;
		user.get({owner: 1, username: 1, registered:1}, {email: body.email}, function (err, doc) {
			if (err) {
				console.log(err);
			} else {
				console.log('auth doc', doc);
				console.log('setting all of session stuff');
				// a lot of functionality depends on those names
				req.session.identity = doc.owner;
				req.session.userid = doc._id;
				res.cookie('email', body.email);
				if (doc.username)
  				res.cookie('username', doc.username);
				req.session.username = doc.username;
				req.session.registered = doc.registered;
				req.session.publicKey = body.publicKey;
				req.session.email = body.email;
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
				var callbackUrl = '&registration-callback=' 
						+ encodeURIComponent(HOST + '/payswarm/complete');
				callback(null, registrationUrl += (callbackUrl));
			},
			function(registrationUrl, callback) {
				res.redirect(registrationUrl);
			}
		], function (err, result) {
			console.log(err);
			res.end('Registration process failed, sorry!');
		});
	},

	completePayswarmRegistration : function (req, res) {
		
		var email = req.cookies.email;

		req.body = JSON.stringify(req.body, null, 2);
		body = JSON.parse(req.body);
		body = JSON.parse(body['encrypted-message']);
		keys.decode(body, function (err, message) {
			if (err) {
				showError(err, res);
			} else {
				var fields = {
					publicKeyUrl : message.publicKey,
					owner : message.owner,
					destination : message.destination,
					registered : true
				}
				user.updateFields(fields, { email : email}, function (err, docs) {
					if (err) {
						res.end('Registration failed');
						console.log(err);
					} else {
						req.session.email = email;
						req.session.registered = true;
						res.redirect('/payswarm/complete');
					}
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
