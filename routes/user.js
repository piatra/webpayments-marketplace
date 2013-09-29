var user = require('../lib/user')();

module.exports = {
	setUsername: function (req, res) {
		if (!req.body.username) {
			res.json({
				err: 'Missing username'
			});
		} else {
			req.session.username = req.body.username;
				user.isUnique({
					username: req.session.username
				},
          	function updateUsername () {
					user.updateFields({
						username: req.body.username
					},
					{ email: req.body.email },
					function updateFieldsError (err) {
							if (err) {
								res.json({ err: err });
							} else {
								res.cookie('username', req.body.username);
								res.json({ 
									responseText: 'Congrats, your username has been updated'
								})
                			}
					})
			},
        	function duplicateUsername () {
				res.json({
					err: 'Sorry that username is already taken'
				})
			});
		}
	}
};