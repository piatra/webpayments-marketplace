define([], function () {
	var modal = {
		show : function (data, options) {
			modal.showOverlay();
			$modal = $('<div/>').addClass('modal');

			if (options) {
				$modal.css(options);
			} else {
				$modal.css({width: '700px', 'margin-left':'-350px'});
			}

			if (data.form) {
				$modal = modal.createForm(data.form, $modal);
			}

			var close = $('<span/>').addClass('close-handler')
						.html('&times;').on('click', modal.remove);

			$modal.append(close);

			$('<h2/>').text(data.title).appendTo($modal);

			data.components.forEach(function (el) {
				var $el = $('<'+ el.tag +'/>');
				for (var i in el) {
					if (i == 'tag') continue;
					if (typeof $el[i] == 'function')
						$el[i](el[i]);
					else
						$el.attr(i, el[i]);
				}
				$modal.append($el);
			})


			if (data.form)
				return $modal.parent();
			else
				return $modal;
		},
		showOverlay : function () {
			$('<div/>').addClass('modal-overlay')
				.appendTo('body').fadeIn();
		},
		remove : function () {
			$('.modal').fadeOut('fast');
			$('.modal-overlay').fadeOut('slow')
		},
		createForm : function (path, $modal) {
			return $('<form/>').attr('method', 'POST')
				.attr('action', path)
				.appendTo($modal);
		}
	}

	return modal;
});