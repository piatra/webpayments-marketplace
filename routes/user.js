var user = require('../lib/user')();

module.exports = {
	setUsername: function (req, res) {
		console.log(user);
		req.session.username = req.body.username;
		user.updateFields({
			username: req.body.username
		},
		{
			email: req.body.email
		}, function (err) {
			if (err) {
				console.log('error while updateing user',err);
			} else {
				res.end('Profile username updated!');
			}
		});
	}
};