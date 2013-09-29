
/*
 * Main pages
 */

var title = 'WebPayments Marketplace';
var assets = require('../lib/asset.js')();
var _ = require('underscore');
var crypto = require('crypto');
var user = require('../lib/user.js')();

function md5 (string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

function options (req) {
  var obj = {
    title: title,
    user: req.session.email || req.cookies.email,
    id: (req.session.userid) ? req.session.userid : null,
    identity: (req.session.identity) ? req.session.identity: null,
    registered: (req.session.registered) ? req.session.registered : null,
    publicKey: (req.session.publicKey) ? req.session.publicKey : null,
    email: req.session.email || req.cookies.email,
    username: req.session.username || req.cookies.username,
    env: process.env.NODE_ENV
  };
  _.forEach(_.rest(_.toArray(arguments)), function (el) {
    obj[el[0]] = el[1];
  });

  obj.hash = obj.user ? md5(obj.user) : null;

  return obj;
}

exports.index = function(req, res) {
	console.log(req.session);
  assets.getUserAssets({}, function (assets) {
    res.render('index', options(req, ['assets', assets]));
  });

};

exports.edit = function (req, res) {
  asset.getAsset({listingId: req.params.id}, function (doc) {
    if (doc.error)
      res.end('Asset not found');
    else
      res.render('edit-asset', options(req));
  });
}

exports.logout = function (req, res) {
	res.session = null;
	res.clearCookie('userID');
	res.clearCookie('email');
	res.render('logout');
}

exports.login = function (req, res) {
    if (req.session.email)
      res.redirect('/');
    else
      res.render('login', options(req));
}

exports.newasset = function(req, res) {
  var userDetails = options(req);
  user.get({owner:1}, {email: userDetails.email}, function (err, doc) {
    if (err) {
      console.log(err);
      res.end('An error has ocurred');
    } else {
      console.log(doc);
      res.render('newasset', options(req, ['payswarmIdentity', doc]));
    }
  })
};
