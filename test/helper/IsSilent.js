define(["helper/Offline", "helper/BufferTest"], function (Offline, BufferTest) {
	return function(callback, duration){
		duration = duration || 0.1;
		return Offline(callback, duration).then(function(buffer){
			return BufferTest.isSilent(buffer);
		});
	};
});