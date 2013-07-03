define(['message', 'modal'], function (message, modal) {
	var loginEv = {
		handleLogin : function (response) {
			console.log(response);
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
				var msg = message.show({
					message : 'You need to register with a payswarm authority',
					href : href,
					appendTo : '.messages',
					newTab : true
				});
				loginEv.completePayswarmRegistration(msg);
			});
		},
		completePayswarmRegistration : function (msg) {
			$('a', msg).on('click', function () {
				modal.show({
					title: 'Complete Payswarm registration',
					components : [
						{tag: 'textarea', placeholder: 'Paste the content here', name: 'payswarm_response'},
						{tag: 'input', type: 'hidden', name: 'email', value: $('.js-handler--login').text()},
						{tag: 'input', type:'submit', value: 'Register', 'class' : 'button--main'}
					],
					form: '/payswarm/complete'
				})
			});
		}
	}

	return loginEv;

});