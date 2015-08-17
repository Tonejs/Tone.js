/* global it, describe, after */

define(["chai", "Tone/core/Tone", "Tone/core/Master", "Tone/core/Bus", 
	"Tone/core/Note", "tests/Common", "Tone/core/Buffer", "Tone/source/Oscillator", "Tone/instrument/SimpleSynth"], 
function(chai, Tone, Master, Bus, Note, Test, Buffer, Oscillator, SimpleSynth){
	var expect = chai.expect;

	describe("Tone.Buffer", function(){
		it ("can be created and disposed", function(){
			var buff = new Tone.Buffer("./testAudio/kick.mp3");
			buff.dispose();
			Test.wasDisposed(buff);
		});

		it("loads a file from a url string", function(done){
			var buffer = new Buffer("./testAudio/kick.mp3", function(buff){
				expect(buff).to.be.instanceof(Buffer);
				buffer.dispose();
				done();
			});
		});

		it("has a duration", function(done){
			var buffer = new Buffer("./testAudio/kick.mp3", function(){
				expect(buffer.duration).to.be.closeTo(0.23, 0.01);
				buffer.dispose();
				done();
			});
		});

		it("the static onload method is invoked", function(done){
			var buffer = new Buffer("./testAudio/hh.mp3");
			Buffer.onload = function(){
				buffer.dispose();
				done();
				//reset this method for the next one
				Buffer.onload = function(){};
			};
		});

		it("the static onprogress method is invoked", function(done){
			var progressWasInvoked = false;
			var buffer = new Buffer("./testAudio/hh.mp3", function(){
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
			var buffer = new Buffer("./testAudio/kick.mp3", function(){
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