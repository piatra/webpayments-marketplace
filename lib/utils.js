module.exports = function () {
	var utils = {};
	var _ = require('underscore');

	// existy(undefined) => false
	// existy(0) => true
	// tests if a value exists
	function existy (x) {
		return x !== null;
	}

	// finds a key in an object of any depth
	// and replaces or sets the value to _newValue_
	// usage setValue.call(obj, key, value)
	function setValue (key, newValue) {
		if (existy(this[key]) && this[key]) {
			this[key] = newValue;
		} else {
			var obj = this;
			_.map(this, function (v, k){
				if (_.isObject(obj[k])) {
					setValue.call(obj[k], key, newValue);
				}
			});
		}
	}

	utils.setValue = setValue;

	return utils;
};