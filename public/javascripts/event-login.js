define(['message'], function (message) {
	var loginEv = {
		handleLogin : function (response) {
			if (response.status == 'okay') {
				$('.js-handler--login').text(response.email);
				if (response.registered == 'false') {
					loginEv.showPayswarmRegistration(response);
				}
			} else {
				alert('Login failed!');
				console.log(response);
			}
		},
		showPayswarmRegistration : function (response) {
			$.post('/payswarm/register/', {
				publicKey : response.publicKey
			}).success(function (href) {
				message.show({
					message : 'You need to register with a payswarm authority',
					href : href,
					appendTo : '.messages',
					newTab : true
				});
			});
		}
	}

	return loginEv;

});