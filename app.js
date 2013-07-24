
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, assets = require('./routes/assets')
	, auth = require('./routes/auth')
	, http = require('http')
	, user = require('./routes/user')
	, path = require('path');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.session({secret: 'webpaymentz'}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
	app.locals.pretty = true;
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);

app.post('/user/set/username', user.setUsername);

app.post('/auth/verify', auth.verify);
app.get('/auth/createKeyPair', auth.createKeyPair);
app.post('/payswarm/register', auth.registerKey);
app.post('/payswarm/complete', auth.complatePayswarmRegistration);

app.get('/newasset', routes.newasset);
app.post('/newasset/process/', assets.createAssetAndListing);
app.post('/newasset/save', assets.saveAsset);

app.get('/assets/created', assets.getUserAssets);
app.get('/assets/:count', assets.getLatestAssets);

app.get('/resign/listing/:id', assets.resignListing);

app.get('/assets/asset/:id', assets.getAsset);
app.get('/listings/listing/:id', assets.getListing);

app.get('/asset/content/:id', function (req, res){
	res.end('The content!');
});

app.get('/assets/:id/purchase', assets.purchase);

app.get('/decrypt/:type/:id', assets.decrypt);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
