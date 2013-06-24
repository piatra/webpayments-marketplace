define(['message', 'event-login', 'modal'], function (message, loginEv, modal) {

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
					verify.assertion(assertion);
				},
				onlogout: function() {
					console.log('logout');
				},
				loggedInUser: undefined
			});

			$('.js-handler--login').on('click', function () {
				navigator.id.request();
			});

		}
	};

	return evHandler;
});