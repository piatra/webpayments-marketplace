var assert = require('assert');
var request = require('request');


describe('server', function(){
	it('should load the main page', function(done){
	  request.get('http://localhost:3000', done);
	});
});

describe('keys.js', function () {
	var keys = require('../../lib/keys.js')();
	it('should read a file', function (done) {
		keys.getKeyPair(function (err){
			done(err);
		});
	});
})