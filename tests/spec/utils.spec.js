var assert = require('assert');
var utils = require('../../lib/utils')();


describe('setValue', function(){
	it('should load', function(){
	  expect(utils.setValue).not.toBe(null);
	});
	it('should replace basic object keys', function () {
		var obj = {name: 'Anrdei'};
		utils.setValue.call(obj, 'name', 'Andrei');
		expect(obj.name).toEqual('Andrei');
	});
	it('should work for objects inside objects', function () {
		var obj = {
			level0 : {
				name: '@ndreio'
			}
		}
		utils.setValue.call(obj, 'name', 'Andrei');
		expect(obj.level0.name).toEqual('Andrei');
	});
	it('should work for objects inside objects', function () {
		var obj = {
			level0: {
				level1: {
					level2: {
						name: '@ndrei0'
					}
				}
			}
		};
		utils.setValue.call(obj, 'name', 'Andrei');
		expect(obj.level0.level1.level2.name).toEqual('Andrei');
	});
	it('should work for objects inside objects', function () {
		var obj = {
			arr: [{
				name: '@ndreio'
			},
			{
				name: '@ndreio'
			}]
		};
		utils.setValue.call(obj, 'name', 'Andrei');
		expect(obj.arr[0].name).toEqual('Andrei');
	});
	it('should not do anything if the value is not there', function () {
		var obj = {
			user : {
				firstName: 'Andrei',
				twitter: '@ndreio'
			}
		};
		utils.setValue.call(obj, 'name', 'Andrei');
	})
});