define(["Test", "Tone/core/Buffer"], function (Test, Buffer) {
	
	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

	var testFile = "./audio/sine.wav";

	describe("Buffer", function(){
		it ("can be created and disposed", function(){
			var buff = new Buffer(testFile);
			buff.dispose();
			Test.wasDisposed(buff);
		});

		it("loads a file from a url string", function(done){
			var buffer = new Buffer(testFile, function(buff){
				expect(buff).to.be.instanceof(Buffer);
				buffer.dispose();
				done();
			});
		});

		it("has a duration", function(done){
			var buffer = new Buffer(testFile, function(){
				expect(buffer.duration).to.be.closeTo(3, 0.01);
				buffer.dispose();
				done();
			});
		});

		it("the static on('load') method is invoked", function(done){
			var buffer = new Buffer(testFile);
			Buffer.on("load", function(){
				buffer.dispose();
				Buffer.off("load");
				done();
			});
		});

		it("can be constructed with an options object", function(done){
			var buffer = new Buffer({
				"url" : testFile,
				"reverse" : true,
				"onload" : function(){
					buffer.dispose();
					done();
				}
			});
		});

		it("takes an AudioBuffer in the constructor method", function(done){
			var buffer = new Buffer({
				"url" : testFile,
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
				"url" : testFile,
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
				"url" : testFile,
				"onload" : function(){
					var testOne = new Buffer(testFile);
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
				"url" : testFile,
				"onload" : function(){
					var testOne = new Buffer(testFile);
					testOne.set(buffer.get());
					expect(testOne.get()).to.equal(buffer.get());
					testOne.dispose();
					buffer.dispose();
					done();
				}
			});
		});

		it("the static on('progress') method is invoked", function(done){
			var buffer = new Buffer(testFile);
			Buffer.on("progress", function(percent){
				expect(percent).to.be.a.number;
				Buffer.off("progress");
				buffer.dispose();
				done();
			});
		});

		it("can reverse a buffer", function(done){
			var buffer = new Buffer(testFile, function(){
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