define([], function () {
	var show = {
		show : function (asset, listing, el) {
			$(el).html(
				JSON.stringify(asset, null, 4) +
				'<br>' +
				JSON.stringify(listing, null, 4)
				);
		}
	}

	return show;
});