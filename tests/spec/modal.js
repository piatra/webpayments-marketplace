define([
		'../../public/javascripts/modal'
	], function (modal) {
		describe("modal module", function () {

			it("should be loaded", function () {
				expect(modal).not.toBe(null);
			});

			it("should generate proper output", function () {
				var options = {
					title: 'Complete Payswarm registration',
					components : [
						{tag: 'textarea', placeholder: 'Paste the content here', name: 'payswarm_response'}
						]
					};
				var m = modal.show(options);
				expect($('h2', m).text()).toEqual(options.title);
			});

			it("should contain a textarea", function () {
				var options = {
					title: 'Complete Payswarm registration',
					components : [
						{tag: 'textarea', placeholder: 'Paste the content here', name: 'payswarm_response'}
						]
					};
				var m = modal.show(options);
				expect($('textarea', m).length).not.toEqual(0);
			});

			it("should contain a textarea with proper values", function () {
				var options = {
					title: 'Complete Payswarm registration',
					components : [
						{tag: 'textarea', placeholder: 'Paste the content here', name: 'payswarm_response'}
						]
					};
				var m = modal.show(options);
				expect($('textarea', m).attr('name')).toEqual(options.components[0].name);
			});


		})
	})