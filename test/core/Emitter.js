define(["Test", "Tone/core/Emitter"], function (Test, Emitter) {

	describe("Emitter", function(){

		it ("can be created and disposed", function(){
			var emitter = new Emitter();
			emitter.dispose();
			Test.wasDisposed(emitter);
		});

		it ("can bind events", function(done){
			var emitter = new Emitter();
			emitter.on("something", function(){
				done();
				emitter.dispose();
			});
			emitter.trigger("something");
		});

		it ("can unbind events", function(){
			var emitter = new Emitter();
			var callback = function(){
				throw new Error("should call this");
			};
			emitter.on("something", callback);
			emitter.off("something", callback);
			emitter.trigger("something");
			emitter.dispose();
		});

		it ("removes all events when no callback is given", function(){
			var emitter = new Emitter();
			emitter.on("something", function(){
				throw new Error("should call this");	
			});
			emitter.on("something", function(){
				throw new Error("should call this");	
			});
			emitter.off("something");
			emitter.trigger("something");
			emitter.dispose();
		});

		it ("can pass arguments to the callback", function(done){
			var emitter = new Emitter();
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
			Emitter.mixin(emitter);
			emitter.on("test", done);
			emitter.trigger("test");
		});
	});
});