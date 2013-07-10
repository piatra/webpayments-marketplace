define(['modal', 'message'], function (modal, message) {

	function assetCreated (response) {
		console.log('asset created');
		modal.show({
			title: 'Asset and listing',
			components : [
				{
					tag: 'pre',
					class: 'container--json',
					html: JSON.stringify(response, null, 4)
				},
				{
					tag: 'input', type:'submit',
					value: 'Publish',
					class: 'topcoat-button--large--cta pull-right js-handler--publish-asset',
				}
			],
			form: '/newasset/save'
		}, {width: '700px', 'margin-left':'-350px'}).appendTo('body');

		$('.js-handler--publish-asset').on('click', assets.publish);

	}

	function errorHandler (err) {
		console.log('error');
		message.show({
			message: 'An error has occured' + err.err
		});
		console.error(err);
	}

	function assetPublished (asset) {
		console.log('created');
		message.show({
			message: 'Asset has been created. Click here to see it',
			href: asset.href
		});
	}

	var assets = {
		create: function (e) {
			console.log('create!!!');
			e.preventDefault();
			var $form = $('form');
			var data = $('form').serialize();
			$.post($form.attr('action'), data)
				.done(assetCreated)
				.fail(errorHandler)
			;

		},
		publish: function (e) {
			var json = JSON.parse($('.container--json').text());
			e.preventDefault();
			console.log('sending data', json);
			$.post('/newasset/save', json)
				.done(assetPublished)
				.fail(errorHandler)
			;
		}
	}

	return assets;
});