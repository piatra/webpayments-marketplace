var fs = require('fs');
console.log('reading');
fs.readFile('./test.txt', 'utf8', function (err, data) {
	console.log(err);
	json = JSON.parse(data);
	console.log(json);
	_clone(json);
});

function _clone(value) {
  if(value && typeof value === 'object') {
    var rval;
    console.log('going to test ', value);
    if(_isArray(value)) {
      rval = [];
      for(var i = 0; i < value.length; ++i) {
        rval[i] = _clone(value[i]);
      }
    }
    else {
      rval = {};
      for(var key in value) {
        rval[key] = _clone(value[key]);
      }
    }
    return rval;
  }
  return value;
}

function _isArray(v) {
  return Array.isArray(v);
}