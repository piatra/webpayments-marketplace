var q = require('q');

var curry = function (m) {
    return function (x) {
        console.log(x, m);
    }
}

function doSomethingAsync() {
  var deferred = q.defer();
  setTimeout(function() {
    deferred.resolve('hello world');
  }, 100);

  return deferred.promise;
}

function doSomethingElseAsync() {
  var deferred = q.defer();
  setTimeout(function() {
    deferred.resolve('hello world #2');
  }, 500);

  return deferred.promise;
}

function test () {
    doSomethingAsync().then(function(val1) {
      doSomethingElseAsync().then(function(val2) {
          console.log(val1, val2);
        });
    });
}

test();
