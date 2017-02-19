define(["Tone/core/Tone", "Tone/core/Offline", "helper/BufferTest"], function (Tone, Offline, BufferTest) {

	return function(callback, duration, channels){
		duration = duration || 0.5;
		channels = channels || 1;
		var testFn = null;
		return Offline(function(Transport){
			testFn = callback(Transport);
		}, duration).then(function(buffer){
			if (channels === 1){
				buffer.toMono();
			} 
			if (testFn){
				var currentTime = 0;
				Tone.context.now = function(){
					return currentTime;
				};
				BufferTest.forEach(buffer, function(){
					if (arguments.length === 3){
						currentTime = arguments[2];
					} else {
						currentTime = arguments[1];
					}
					testFn.apply(undefined, arguments);
				});
			}
		});
	};
});