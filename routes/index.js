
/*
 * Main pages
 */

var title = 'WebPayments Marketplace';
var assets = require('../lib/asset.js')();

exports.index = function(req, res) {
  console.log('serving index');
  assets.getUserAssets({}, function (assets) {
    
    res.render('index', {
    	title: title,
    	user: (req.session.email) ? req.session.email : null,
      id: (req.session.userid) ? req.session.userid : null,
      identity: (req.session.identity) ? req.session.identity: null,
      assets: assets.slice(0,4)
    });
  });

};

exports.login = function (req, res) {
  res.render('login', {
    title: title + ' - login'
  })
}

exports.newasset = function(req, res) {
  console.log('new asset', req.session.username);
  res.render('newasset', {
  	title: 'Create an asset',
  	user : (req.session.email) ? req.session.email : null,
    identity: (req.session.identity) ? req.session.identity: null,
    id : (req.session.userid) ? req.session.userid : null,
    username: (req.session.username) ? req.session.username : null
  });
};