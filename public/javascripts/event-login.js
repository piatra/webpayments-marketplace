define(['message', 'modal'], function (message, modal) {
	var loginEv = {
		handleLogin : function (response) {
			if (response.status == 'okay') {
				$('.js-handler--login')
					.remove();
				$('.js-handler--email').text(response.email)
					.parent().removeClass('hidden');
				// if (response.registered == 'false') {
				// 	loginEv.showPayswarmRegistration(response);
				// }
			} else {
				alert('Login failed!');
				console.log(response);
			}
		},
		showPayswarmRegistration : function (response) {
			$.post('/payswarm/register/', {
				publicKey : response.publicKey
			}).success(loginEv.displayPayswarmMsg);
		},
		displayPayswarmMsg: function (href) {
			var msg = message.show({
				message : 'You need to register with a payswarm authority',
				href : href,
				appendTo : '.messages',
				newTab : true
			});
			loginEv.completePayswarmRegistration(msg);
		},
		completePayswarmRegistration : function (msg) {
			$('a', msg).on('click', function () {
				modal.show({
					title: 'Complete Payswarm registration',
					components : [
						{tag: 'textarea', placeholder: 'Paste the content here', name: 'payswarm_response'},
						{tag: 'input', type: 'hidden', name: 'email', value: $('.js-handler--email').text()},
						{tag: 'input', type:'submit', value: 'Register', 'class' : 'button--main'}
					],
					form: '/payswarm/complete'
				}).appendTo('body');
			});
		}
	}

	return loginEv;

});