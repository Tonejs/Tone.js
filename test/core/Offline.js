import Test from "helper/Test";
import Offline from "Tone/core/Offline";
import Context from "Tone/core/Context";
import OfflineContext from "Tone/core/OfflineContext";
import Transport from "Tone/core/Transport";
import Oscillator from "Tone/source/Oscillator";
import Tone from "Tone/core/Tone";
import AudioBuffer from "Tone/core/Buffer";
import BufferTest from "helper/BufferTest";

describe("Offline", function(){

	it("exists", function(){
		expect(Offline).to.exist;
		expect(Tone.Offline).to.exist;
	});

	it("accepts a callback and a duration", function(){
		Offline(function(){}, 0.01);
	});

	it("returns a promise", function(){
		expect(Offline(function(){}, 0.01)).to.have.property("then");
	});

	it("generates a buffer", function(done){
		Offline(function(){}, 0.01).then(function(buffer){
			expect(buffer).to.be.instanceOf(AudioBuffer);
			done();
		});
	});

	it("silent by default", function(done){
		Offline(function(){}, 0.01).then(function(buffer){
			BufferTest(buffer);
			expect(buffer.isSilent()).to.be.true;
			done();
		});
	});

	it("records the master output", function(){
		return Offline(function(){
			new Oscillator().toMaster().start();
		}, 0.01).then(function(buffer){
			BufferTest(buffer);
			expect(buffer.isSilent()).to.be.false;
		});
	});

	it("overrides Tone.context with OfflineContext during the callback", function(){
		return Offline(function(){
			expect(Tone.context).to.be.an.instanceof(OfflineContext);
		}, 0.01);
	});

	it("does not restore Tone.context during asynchronous calls", function(){
		return Offline(function(){
			return Promise.resolve().then(function () {
				expect(Tone.context).to.be.an.instanceof(OfflineContext);
			});
		}, 0.01);
	});

	it("restores Tone.context immediately", function(){
		var promise = Offline(function(){}, 0.01);
		expect(Tone.context).to.be.an.instanceof(Context);
		return promise;
	});

	it("returning a promise defers the rendering till the promise resolves", function(){
		var wasInvoked = false;
		return Offline(function(){
			new Oscillator().toMaster().start();
			return new Promise(function(done){
				setTimeout(done, 100);
			}).then(function(){
				wasInvoked = true;
			});
		}, 0.01).then(function(buffer){
			BufferTest(buffer);
			expect(wasInvoked).to.be.true;
			expect(buffer.isSilent()).to.be.false;
		});
	});

	it("can schedule specific timing outputs", function(){
		return Offline(function(){
			new Oscillator().toMaster().start(0.05);
		}, 0.1).then(function(buffer){
			BufferTest(buffer);
			expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.0001);
		});
	});

	it("can schedule Transport events", function(){
		return Offline(function(Transport){
			var osc = new Oscillator().toMaster();
			Transport.schedule(function(time){
				osc.start(time);
			}, 0.05);
			Transport.start(0);
		}, 0.1).then(function(buffer){
			BufferTest(buffer);
			expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.001);
		});
	});

});

