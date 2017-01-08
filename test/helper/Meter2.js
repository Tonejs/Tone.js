define(["Tone/core/Tone", "helper/Meter"], function (Tone, Meter) {

	return function(callback, duration, channels){

		var meter = new Meter(duration, channels);

		meter.before(function(output){
			callback(output, function testFn(cb){
				meter.test(cb);
			}, function(cb){
				meter.after(cb);
			});
		});

		meter.run();
	};
});