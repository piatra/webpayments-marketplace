define([], function () {

	function readFile (file) {
		var reader = new FileReader();
		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				// FIXME (emit events?)
				// Render thumbnail.
				var span = document.createElement('span');
				span.innerHTML = ['<p><img class="thumb" src="', e.target.result,
					'" title="', escape(theFile.name), '"/>',
					'<input type="checkbox" id="', escape(theFile.name) ,'">Is this a preview ?</p>'].join('');
				$('#preview').html(span);
			};
		})(file);

		// Read in the image file as a data URL.
		reader.readAsDataURL(file);
	}

	function sendFile () {
		var formData = new FormData();
		var file = this.files[0];
		var progress = document.createElement('progress');
			progress.value = 0;
			progress.max = 100;
			progress.innerHTML = '0%'
			$(this).replaceWith(progress);

		if (file.type.match('image.*')) {
			$('button[type=submit]').attr('disabled', true);
			readFile(file);
		}

		var attached = $('.js-handler--filesAttached')[0].innerHTML.split(', ');
		attached.push(escape(file.name));
		$('.js-handler--filesAttached')[0].innerHTML = attached.join(', ');

		formData.append('myFile', file);

		var xhr = new XMLHttpRequest();

		xhr.open('post', '/upload', true);

		xhr.upload.onprogress = function(e) {
			if (e.lengthComputable) {
				var percentage = (e.loaded / e.total) * 100;
				$('progress').attr('value', percentage).text(percentage + '%');
			}
		};

		xhr.onerror = function(e) {
			console.log('An error occurred while submitting the form. Maybe your file is too big');
		};

		xhr.onload = function() {
			if (this.status == 200) {
				var $fileInput = $('<input type="file" class="topcoat-text-input">');
				$('progress').replaceWith($fileInput);
				$fileInput.on('change', sendFile);
				$('button[type=submit]').attr('disabled', false);
			}
		};

		xhr.send(formData);
	}

	return {
		sendFile: sendFile
	}
})