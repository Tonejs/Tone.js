define(["Test", "Tone/core/Buffer"], function (Test, Buffer) {

	describe("Buffer", function(){
		it ("can be created and disposed", function(){
			var buff = new Buffer("./audio/kick.mp3");
			buff.dispose();
			Test.wasDisposed(buff);
		});

		it("loads a file from a url string", function(done){
			var buffer = new Buffer("./audio/kick.mp3", function(buff){
				expect(buff).to.be.instanceof(Buffer);
				buffer.dispose();
				done();
			});
		});

		it("has a duration", function(done){
			var buffer = new Buffer("./audio/kick.mp3", function(){
				expect(buffer.duration).to.be.closeTo(0.23, 0.01);
				buffer.dispose();
				done();
			});
		});

		it("the static onload method is invoked", function(done){
			var buffer = new Buffer("./audio/hh.mp3");
			Buffer.onload = function(){
				buffer.dispose();
				done();
				//reset this method for the next one
				Buffer.onload = function(){};
			};
		});

		it("can be constructed with an options object", function(done){
			var buffer = new Buffer({
				"url" : "./audio/hh.mp3",
				"reverse" : true,
				"onload" : function(){
					buffer.dispose();
					done();
				}
			});
		});

		it("takes an AudioBuffer in the constructor method", function(done){
			var buffer = new Buffer({
				"url" : "./audio/hh.mp3",
				"onload" : function(){
					var testOne = new Buffer(buffer.get());
					expect(testOne.get()).to.equal(buffer.get());
					testOne.dispose();
					buffer.dispose();
					done();
				}
			});
		});

		it("takes a Tone.Buffer in the constructor method", function(done){
			var buffer = new Buffer({
				"url" : "./audio/hh.mp3",
				"onload" : function(){
					var testOne = new Buffer(buffer);
					expect(testOne.get()).to.equal(buffer.get());
					testOne.dispose();
					buffer.dispose();
					done();
				}
			});
		});

		it("takes Tone.Buffer in the set method", function(done){
			var buffer = new Buffer({
				"url" : "./audio/hh.mp3",
				"onload" : function(){
					var testOne = new Buffer("./audio/hh.mp3");
					testOne.set(buffer);
					expect(testOne.get()).to.equal(buffer.get());
					testOne.dispose();
					buffer.dispose();
					done();
				}
			});
		});

		it("takes AudioBuffer in the set method", function(done){
			var buffer = new Buffer({
				"url" : "./audio/hh.mp3",
				"onload" : function(){
					var testOne = new Buffer("./audio/hh.mp3");
					testOne.set(buffer.get());
					expect(testOne.get()).to.equal(buffer.get());
					testOne.dispose();
					buffer.dispose();
					done();
				}
			});
		});

		it("the static onprogress method is invoked", function(done){
			var progressWasInvoked = false;
			var buffer = new Buffer("./audio/hh.mp3", function(){
				buffer.dispose();
				expect(progressWasInvoked).to.be.true;
				done();
			});
			Buffer.onprogress = function(){
				progressWasInvoked = true;
				//reset this method for the next one
				Buffer.onprogress = function(){};
			};
		});

		it("can reverse a buffer", function(done){
			var buffer = new Buffer("./audio/kick.mp3", function(){
				var buffArray = buffer.get();
				var lastSample = buffArray[buffArray.length - 1];
				buffer.reverse = true;
				expect(buffer.get()[0]).to.equal(lastSample);
				buffer.dispose();
				done();
			});
		});
	});
});