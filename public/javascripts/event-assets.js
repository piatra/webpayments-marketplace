define([], function () {

	function assetCreated (response) {
		console.log(response);
	}

	function errorHandler (err, response) {
		console.log(response);
		console.error(err);
	}

	var assets = {
		create: function (e) {
			e.preventDefault();
			var $form = $('form');
			var data = $('form').serialize();
			$.post($form.attr('action'), data)
				.done(assetCreated)
				.fail(errorHandler)
			;

		}
	}

	return assets;
});