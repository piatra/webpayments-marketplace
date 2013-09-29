define([], function () {

	var formHandler = {
		duplicateRow: function (e) {
			e.preventDefault();
			var $this = $(this);
			var row = $this.parents('tr');

			var rowClone = row.clone();
			rowClone.insertAfter(row);

			$this.parents('p').remove();
			rowClone.find('a').on('click', formHandler.duplicateRow);
		}
	}

	return formHandler;

});