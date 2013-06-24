define([], function () {
	var message = {
		show : function (msgData) {
			var close = $('<span/>').addClass('close-handler')
						.html('&times;').on('click', message.remove);
			var msg = $('<p/>').addClass('message').html(message.create(msgData))
					.append(close).appendTo(msgData.appendTo);

			return msg;
		},
		create: function (msgData) {
			var a = $('<a/>').attr('href', msgData.href)
				.text(msgData.message)
			if (msgData.newTab)
				a.attr('target', '_blank');
			return a;
		},
		remove : function (e) {
			e.preventDefault();
			$(this).parents('.message').fadeOut();
		}
	}

	return message;
});