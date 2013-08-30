define([
	'message',
	'event-login',
	'event-assets',
	'modal'
	], function (message, loginEv, assetsEv, modal, upload) {

	var verify = {
		assertion : function (assertion) {
			$.post("/auth/verify", { assertion: assertion })
				.success(loginEv.handleLogin)
				.fail(function (data) {
					console.log('fail', data);
				})
			;
		}
	};

	var evHandler = {
		init : function () {

			var email = ($('img', $('.js-handler--login')).length)
					? null
					: $('.js-handler--login').text().trim()
			;

			navigator.id.watch({
				onlogin: function(assertion) {
					if ($('img', $('.js-handler--login')).length)
						verify.assertion(assertion);
					else {
						// console.log('count');
						// assetsEv.count(email);
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

			// $('.js-handler--change-username').on('submit', assetsEv.create(assetsEv.usernameChanged));

			// FIXME
			// if ($('.js-handler--show-payswarm-verify').length) {
			// 	$.post('/payswarm/register/', {
			// 		publicKey: $('.js-handler--show-payswarm-verify').text()
			// 	}).success(loginEv.displayPayswarmMsg);
			// }

//			assetsEv.loadLatest($('.container--newest'));
			console.log('count');
			assetsEv.count(email);

		}
	};

	return evHandler;
});