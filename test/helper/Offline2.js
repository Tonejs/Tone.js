define(["Tone/core/Tone", "helper/Offline"], function (Tone, Offline) {

	/**
	 *  OFFLINE TESTING
	 */
	return function(callback, duration, channels){

		var offline = new Offline(duration, channels);

		/*offline.before(callback.bind(window, undefined, function testFn(cb){
			offline.test(cb);
		}, function tearDown(cb){
			offline.after(cb);
		}));*/

		offline.before(function(output){
			callback(output, function testFn(cb){
				offline.test(cb);
			}, function(cb){
				offline.after(cb);
			});
		});

		offline.run();
	};
});