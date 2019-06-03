import Test from "helper/Test";
import Buffer from "Tone/core/Buffer";
import Tone from "Tone/core/Tone";

var testFile = "./audio/sine.wav";

describe("Buffer", function(){

	context("basic", function(){

		it("can be created and disposed", function(){
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

		it("can be constructed with no arguments", function(){
			var buffer = new Buffer();
			expect(buffer.length).to.equal(0);
			expect(buffer.duration).to.equal(0);
			expect(buffer.numberOfChannels).to.equal(0);
			buffer.dispose();
		});

		it("can get the number of channels", function(done){
			var buffer = new Buffer(testFile, function(){
				expect(buffer.numberOfChannels).to.be.equal(1);
				buffer.dispose();
				done();
			});
		});

		it("can get the length of the buffer", function(done){
			var buffer = new Buffer(testFile, function(){
				expect(buffer.length).to.be.a.number;
				expect(buffer.length).to.be.above(130000);
				buffer.dispose();
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

		it("takes an unloaded Tone.Buffer in the constructor method", function(done){
			var unloadedBuffer = new Buffer(testFile);
			var buffer = new Buffer({
				"url" : unloadedBuffer,
				"onload" : function(){
					var testOne = new Buffer(buffer);
					expect(unloadedBuffer.get()).to.equal(buffer.get());
					unloadedBuffer.dispose();
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
	});

	context("loading", function(){

		it("invokes the error callback if there is a problem with the file", function(done){
			var buffer = new Buffer("nosuchfile.wav", function(){
				throw new Error("shouldn't invoke this function");
			}, function(e){
				buffer.dispose();
				done();
			});
		});

		it("invokes the error callback on static .load method", function(done){
			Buffer.load("nosuchfile.wav", function(){
				Buffer.cancelDownloads();
				throw new Error("shouldn't invoke this function");
			}, function(){
				Buffer.cancelDownloads();
				done();
			});
		});

		it("can load a file with fallback extensions", function(done){
			Buffer.load("./audio/sine.[nope|nada|wav]", function(buffer){
				expect(buffer).to.exist;
				done();
			});
		});

		it("takes the first supported format when multiple extensions are provided", function(done){
			Buffer.load("./audio/sine.[wav|nope]", function(buffer){
				expect(buffer).to.exist;
				done();
			});
		});

		it("can pass in multiple extensions in Buffer instance", function(done){
			var buffer = new Buffer("./audio/sine.[nope|wav]", function(){
				buffer.dispose();
				done();
			});
		});

		it("instance .load method returns Promise", function(done){
			var promise = (new Buffer()).load(testFile);
			expect(promise).to.have.property("then");
			promise.then(function(buff){
				expect(buff).to.be.instanceOf(Buffer);
				done();
			});
			promise.catch(function(){
				throw new Error("shouldn't invoke this function");
			});
		});

		it("invokes the error callback if the file is corrupt", function(done){
			var buffer = new Buffer("./audio/corrupt.wav", function(){
				throw new Error("shouldn't invoke this function");
			}, function(e){
				buffer.dispose();
				done();
			});
		});
	});

	context("events", function(){

		it("the static on('error') method is invoked", function(done){
			Buffer.on("error", function(e){
				buffer.dispose();
				Buffer.cancelDownloads();
				Buffer.off("error");
				done();
			});
			var buffer = new Buffer("nosuchfile.wav");
		});

		it("the static on('load') method is invoked", function(done){
			var buffer = new Buffer(testFile);
			Buffer.on("load", function(){
				buffer.dispose();
				Buffer.off("load");
				done();
			});
		});

		it("the static on('progress') method is invoked", function(done){
			var buffer = new Buffer(testFile);
			Buffer.on("progress", function(percent){
				expect(percent).to.be.a.number;
				expect(percent).to.be.within(0, 1);
				if (percent === 1){
					Buffer.off("progress");
					buffer.dispose();
					done();
				}
			});
		});
	});

	context("buffer manipulation", function(){

		it("can get the channel data as an array", function(done){
			var buffer = new Buffer(testFile, function(){
				expect(buffer.getChannelData(0)).to.be.an.instanceOf(Float32Array);
				expect(buffer.getChannelData(0).length).to.be.above(130000);
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

		it("can convert from an array", function(){
			var buffer = new Buffer();
			var arr = new Float32Array(0.5 * buffer.context.sampleRate);
			arr[0] = 0.5;
			buffer.fromArray(arr);
			expect(buffer.duration).to.equal(0.5);
			expect(buffer.numberOfChannels).to.equal(1);
			//test the first sample of the first channel to see if it's the same
			expect(buffer.toArray(0)[0]).to.equal(0.5);
			buffer.dispose();
		});

		it("can create a buffer from an array using the static method", function(){
			var arr = new Float32Array(0.5 * Tone.context.sampleRate);
			arr[0] = 0.5;
			var buffer = Buffer.fromArray(arr);
			expect(buffer.duration).to.equal(0.5);
			expect(buffer.numberOfChannels).to.equal(1);
			//test the first sample of the first channel to see if it's the same
			expect(buffer.toArray(0)[0]).to.equal(0.5);
			buffer.dispose();
		});

		it("can convert from a multidimentional array", function(){
			var buffer = new Buffer();
			var arr = [new Float32Array(0.5 * buffer.context.sampleRate), new Float32Array(0.5 * buffer.context.sampleRate)];
			arr[0][0] = 0.5;
			buffer.fromArray(arr);
			expect(buffer.duration).to.equal(0.5);
			expect(buffer.numberOfChannels).to.equal(2);
			expect(buffer.toArray(0)[0]).to.equal(0.5);
			buffer.dispose();
		});

		it("can convert to and from an array", function(){
			var buffer = new Buffer();
			var arr = [new Float32Array(0.5 * buffer.context.sampleRate), new Float32Array(0.5 * buffer.context.sampleRate)];
			arr[0][0] = 0.5;
			buffer.fromArray(arr);
			expect(buffer.toArray(0)[0]).to.equal(0.5);
			expect(buffer.toArray()[0][0]).to.equal(0.5);
			//with a selected channel
			expect(buffer.toArray(0)[0]).to.equal(0.5);
			buffer.dispose();
		});

		it("can slice a portion of the array", function(done){
			var buffer = new Buffer(testFile, function(){
				//original duration
				expect(buffer.duration).to.be.closeTo(3, 0.01);
				var sliced1 = buffer.slice(0, 1);
				//does not modify the original
				expect(buffer.duration).to.be.closeTo(3, 0.01);
				expect(sliced1.duration).to.be.closeTo(1, 0.01);
				var sliced2 = sliced1.slice(0.5);
				expect(sliced2.duration).to.be.closeTo(0.5, 0.01);

				buffer.dispose();
				sliced1.dispose();
				sliced2.dispose();
				done();
			});
		});
	});

	context("static methods", function(){

		it("Test if the browser supports the given type", function(){
			expect(Buffer.supportsType("test.wav")).to.be.true;
			expect(Buffer.supportsType("wav")).to.be.true;
			expect(Buffer.supportsType("path/to/test.wav")).to.be.true;
			expect(Buffer.supportsType("path/to/test.nope")).to.be.false;
		});

		it("can cancel the downloads", function(){
			var buff0 = new Buffer(testFile);
			var buff1 = new Buffer(testFile);
			Buffer.cancelDownloads();
			expect(Buffer._downloadQueue.length).to.equal(0);
		});

		it("can be constructed with Buffer.fromUrl", function(done){
			Buffer.fromUrl("nosuchfile.wav").then(function(){
				throw new Error("shouldn't invoke this function");
			}).catch(function(){
				done();
			});
		});
	});

});

describe("Tone.loaded()", function(){

	it("returns a promise", function(){
		expect(Tone.loaded()).to.have.property("then");
	});

	it("is invoked when all the buffers are loaded", function(){
		Buffer.cancelDownloads();
		var buff0 = new Buffer(testFile);
		var buff1 = new Buffer(testFile);
		return Tone.loaded();
	});

	it("invokes an error if one of the buffers is not found", function(done){
		Buffer.cancelDownloads();
		// expect(Tone.loaded)
		var buff0 = new Buffer(testFile);
		var buff1 = new Buffer("nosuchfile.wav");
		Tone.loaded().catch(function(e){
			expect(e).to.be.instanceOf(Error);
			done();
		});
	});
});

