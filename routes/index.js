
/*
 * Main pages
 */

var title = 'WebPayments Marketplace'

exports.index = function(req, res) {
  res.render('index', {
  	title: title,
  	user : (req.session.email) ? req.session.email : false
  });
};

exports.login = function (req, res) {
  res.render('login', {
    title: title + ' - login'
  })
}

exports.newasset = function(req, res) {
  res.render('newasset', {
  	title: title + ' - register asset',
  	user : (req.session.email) ? req.session.email : false
  });
};