define([], function () {

	function existy (x) {
		return x != null;
	}

	function assert (value, message) {
		if (!existy(value)) {
			throw new Error(message);
		}
	}

	return assert;
});