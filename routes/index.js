
/*
 * Main pages
 */

var title = 'WebPayments Marketplace';
var assets = require('../lib/asset.js')();
var _ = require('underscore');

function options (req) {
  var obj = {
    title: title,
    user: (req.session.email) ? req.session.email : null,
    id: (req.session.userid) ? req.session.userid : null,
    identity: (req.session.identity) ? req.session.identity: null,
    registered: (req.session.registered) ? req.session.registered : null,
    publicKey: (req.session.publicKey) ? req.session.publicKey : null,
    email: (req.session.email) ? req.session.email : null,
    username: (req.session.username) ? req.session.username : null,
    env: process.env.NODE_ENV
  };
  _.forEach(_.rest(_.toArray(arguments)), function (el) {
    obj[el[0]] = el[1];
  });
  return obj;
}

exports.index = function(req, res) {
  assets.getUserAssets({}, function (assets) {
    res.render('index', options(req, ['assets', assets]));
  });

};

exports.login = function (req, res) {
  res.render('login', options(req));
}

exports.newasset = function(req, res) {
  res.render('newasset', options(req));
};