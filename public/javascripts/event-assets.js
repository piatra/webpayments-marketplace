define(['modal', 'message'], function (modal, message) {

	function assetCreated (response) {
		console.log('asset created');
		modal.show({
			title: 'Asset and listing',
			components : [{
				tag: 'p',
				text: 'You asset and listing have been created and publised',
			}]
		}).appendTo('body');

		$('.close-handler').on('click', function () {
			location.href = '/';
		});
	}

	function usernameChanged (response) {
		modal.show({
			title: 'Your username has been set',
			components : [{
				tag: 'p',
				text: 'Congrats you now have a username!',
			}]
		}).appendTo('body');

		$('.close-handler').on('click', function () {
			location.href = '/newasset';
		});
	}

	function setAssetCount (count) {
		if (parseInt(count, 10)) {
			$('.topcoat-notification').text(count).removeClass('hidden');
		}
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
			if (!d.listing.payee[0]) return;
			var title = d.asset.title + '<p><em><small>' + d.listing.payee[0].comment + '</small></em> | <a href="/assets/asset/'+ d.listing.assetId +'/edit">edit</a></p>';
			$('<li></li>').addClass('topcoat-list__item')
				.html(title).appendTo('.js-handler--asset-list');
		});
	}

	var assets = {
		// handler: .js-handler--create-asset
		// on 	  : submit
		// action : /newasset/process/
		create: function (cb) {
			return function (e) {
				e.preventDefault();
				var data = $('form').serialize();
				$.post($('form').attr('action'), data)
					.done(cb)
					.fail(errorHandler)
				;
			}
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
					setListAssets(resp);
				})
				.fail(errorHandler)
			;
		},
		usernameChanged: usernameChanged,
		assetCreated: assetCreated
	}

	return assets;
});