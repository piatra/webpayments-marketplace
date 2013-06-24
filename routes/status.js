status = {
	showMessage : function (err) {
		if (err) {
			res.render('status', {
				title : 'An error has ocurred',
				message : err
			});
		} else {
			res.render('status', {
				title : 'Done',
				message : 'Action completed succesfully'
			});
		}
	}
}