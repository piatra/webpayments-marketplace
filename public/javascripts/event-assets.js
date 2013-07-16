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
		}).appendTo('body');

		$('.js-handler--publish-asset').on('click', assets.publish);
	}

	function setAssetCount (count) {
		$('.topcoat-notification').text(count);
	}

	function errorHandler (err) {
		console.log('error');
		message.show({
			message: 'An error has occured' + err.err
		});
		console.error(err);
	}

	function assetPublished (asset) {
		modal.remove();
		var $msg = message.show('Your asset has been created. View your assets in the top right corner')
		$msg.appendTo('.messages');
	}

	function setListAssets (docs) {
		docs.forEach(function (d) {
			if (!d.listing) return;
			var title = d.asset.title + '<br><em><small>' + d.listing.payee[0].comment + '</small></em>';
			$('<li></li>').addClass('topcoat-list__item')
				.html(title).appendTo('.js-handler--asset-list');
		});
	}

	var assets = {
		create: function (e) {
			e.preventDefault();
			var data = $('form').serialize();
			$.post($('form').attr('action'), data)
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
		},
		count: function (email) {
			$.get(location.origin + '/assets/created')
				.done(function (resp) {
					setAssetCount(resp.length);
					setListAssets(resp);
				})
				.fail(errorHandler)
			;
		},
		loadLatest: function () {
			$.get(location.origin + '/assets/5')
				.done(function (resp) {
					setAssetCount(resp.length);
					setListAssets(resp);
				})
				.fail(errorHandler)
			;
		}
	}

	return assets;
});