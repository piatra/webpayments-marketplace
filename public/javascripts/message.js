define([], function () {
	var message = {
		show : function (msgData) {
			var close = $('<span/>').addClass('close-handler')
						.html('&times;').on('click', message.remove);

			var msg = $('<p></p>').addClass('message');

			if (typeof msgData == 'string')
				msg.html(msgData).append(close)
					.appendTo(msgData.appendTo);
			else
				msg.html(message.create(msgData))
					.append(close).appendTo(msgData.appendTo);

			return msg.length ? $(msg[0]) : $(msg);
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