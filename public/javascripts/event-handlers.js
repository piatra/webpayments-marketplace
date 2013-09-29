/* global define, $, console */

'use strict';

define([
	'message',
	'event-login',
	'event-assets',
	'user',
	'formHandler'
], function (message, loginEv, assetsEv, user, formHandler) {

	var verify = {
		assertion : function (assertion) {

			$('.js-handler--login').html('Logging in').addClass('loading');

			$.post('/auth/verify', { assertion: assertion })
				.success(loginEv.handleLogin)
				.fail(function (data) {
					console.log('fail', data);
				})
				.done(function () {
					console.log('done');
				})
			;
		}
	};

	var evHandler = {
		init : function () {

			var email = $('.js-handler--email').text().trim();

			user = user({
				email: email
			});
			
			if (typeof logout != 'undefined' && logout)
				email = null;
			else
				var logout = false;

			navigator.id.watch({
				onlogin: function(assertion) {
					if (!logout && $('img', $('.js-handler--login:not(.hidden)')).length) {
						verify.assertion(assertion);
					}
				},
				onlogout: function() {
					console.log('logout');
				},
				loggedInUser: email
			});

			$('.js-handler--login').on('click', function () {
				navigator.id.request();
			});

			$('.js-handler--change-username').on('submit', user.setUsername);

			if (email) assetsEv.count(email);

			$('.js-handler--add-more-payee').on('click', formHandler.duplicateRow)

		}
	};

	return evHandler;
});
