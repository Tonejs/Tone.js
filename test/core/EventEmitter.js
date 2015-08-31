define(["Test", "Tone/core/EventEmitter"], function (Test, EventEmitter) {

	describe("EventEmitter", function(){

		it ("can be created and disposed", function(){
			var emitter = new EventEmitter();
			emitter.dispose();
			Test.wasDisposed(emitter);
		});

		it ("can bind events", function(done){
			var emitter = new EventEmitter();
			emitter.on("something", function(){
				done();
				emitter.dispose();
			});
			emitter.trigger("something");
		});

		it ("can unbind events", function(){
			var emitter = new EventEmitter();
			var callback = function(){
				throw new Error("should call this");
			};
			emitter.on("something", callback);
			emitter.off("something", callback);
			emitter.trigger("something");
			emitter.dispose();
		});

		it ("can pass arguments to the callback", function(done){
			var emitter = new EventEmitter();
			emitter.on("something", function(arg0, arg1){
				expect(arg0).to.equal("A");
				expect(arg1).to.equal("B");
				emitter.dispose();
				done();
			});
			emitter.trigger("something", "A", "B");
		});

		it ("can mixin its methods to another object", function(done){
			var emitter = {};
			EventEmitter.mixin(emitter);
			emitter.on("test", done);
			emitter.trigger("test");
		});
	});
});