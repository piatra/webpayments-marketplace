define([], function () {
	var message = {
		show : function (msgData) {
			var close = $('<span/>').addClass('close-handler')
						.html('&times;').on('click', message.remove);

			var msg = $('<p></p>').addClass('message');

			console.log(msgData);
			if (typeof msgData == 'string')
				msg.html(msgData).append(close)
					.appendTo(msgData.appendTo);
			else
				msg.html(message.create(msgData))
					.append(close).appendTo(msgData.appendTo);

			return msg.length ? $(msg[0]) : $(msg);
		},
		success: function (status) {
			message.show(status.responseText).appendTo('.messages');
		},
		failure: function (status) {
			message.show('An error has occured: ' + status.err).appendTo('.messages');
		},
		display: function (status) {
			console.log('display', status);
			if (status.err) {
				message.failure(status);
			} else {
				message.success(status);
			}
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