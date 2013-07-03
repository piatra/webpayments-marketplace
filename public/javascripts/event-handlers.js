define(['message', 'event-login', 'modal', 'event-assets'], function (message, loginEv, modal, assetsEv) {

	var verify = {
		assertion : function (assertion) {
			$.post("/auth/verify", { assertion: assertion })
			.success(loginEv.handleLogin).fail(function (data) {
				console.log('fail', data);
			});
		}
	};

	var evHandler = {
		init : function () {
			navigator.id.watch({
				onlogin: function(assertion) {
					if ($('img', $('.js-handler--login')).length)
						verify.assertion(assertion);
					else
						console.log('has session is logged in');
				},
				onlogout: function() {
					console.log('logout');
				},
				loggedInUser: undefined
			});

			$('.js-handler--login').on('click', function () {
				navigator.id.request();
			});

			$('.js-handler--create-asset').on('click', assetsEv.create);

		}
	};

	return evHandler;
});