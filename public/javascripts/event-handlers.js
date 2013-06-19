define([], function () {

	var login = document.querySelector('.js-handler--login');

	var verify = {
		assertion : function (assertion) {
			console.log('verifying ', assertion);
			$.post("/auth/verify", { assertion: assertion }, function (data) {
				console.log('sent ', data);
			}).success(function (response) {
				if (response.status == 'okay') {
					document.querySelector('.js-handler--login').innerHTML = response.email;
				}
			}).done(function (data) {
				console.log('done', data);
			}).fail(function (data) {
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

			login.addEventListener('click', function () {
				navigator.id.request();
			}, false);

		}
	};

	return evHandler;
});