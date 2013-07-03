define([
		'../../public/javascripts/message'
	], function (message) {
		describe("Message module", function () {

			it("should be loaded", function () {
				expect(message).not.toBe(null);
			});

			it("show have a show() method", function () {
				expect(message.show).not.toBe(null);
			})

			it("show generate a valid message", function () {
				var msg = {
					message : 'You need to register with a payswarm authority'
				};
				// a bit of a hack here
				var $msg = $(message.show(msg).prevObject[0]).text();
				expect($msg.slice(0,-1)).toEqual(msg.message);
			});

		})
	})