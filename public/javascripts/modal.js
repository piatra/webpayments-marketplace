define([], function () {
	var modal = {
		show : function (data) {
			modal.showOverlay();
			$modal = $('<div/>').addClass('modal');

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
					$el.attr(i, el[i]);
				}
				$modal.append($el);
			})

			if (data.form)
				$modal.parent().appendTo('body');
			else
				$modal.appendTo('body');
		},
		showOverlay : function () {
			$('<div/>').addClass('modal-overlay')
				.appendTo('body').fadeIn();
		},
		remove : function (e) {
			e.preventDefault();
			$(this).parents('.modal').fadeOut('fast');
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