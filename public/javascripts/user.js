define(['assert', 'message'], function (assert, message) {

	var user = {
		options : null,
		setUsername : function (e) {
			var username = $('input[name=username]', this).val();
			var submit = $('button[type=submit]', this);
			console.log(submit);
			e.preventDefault();

			assert(user.options.email, 'Email required for user');

			submit.addClass('loading');

      $.ajax({
				type: "POST",
				url: "/user/set/username",
				data: {username: username}
			}).success(message.display)
			  .fail(message.failure)
			  .done(function () {
			  	submit.removeClass('loading');
			  	location.reload();
			  });
		}
	}

	function userOptions (opt) {
		user.options = opt;

		return user;
	}

	return userOptions;
});
