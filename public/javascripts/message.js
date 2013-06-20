define([], function () {
	var message = {
		show : function (msgData) {
			var a = $('<a/>').attr('href', msgData.href)
				.text(msgData.message)
				.appendTo(msgData.appendTo);
			if (msgData.newTab)
				a.attr('target', '_blank');
		}
	}

	return message;
});