/* global it, describe, after */

define(["chai", "Tone/core/Tone", "Tone/core/Master", "Tone/core/Bus", 
	"Tone/core/Note", "tests/Common", "Tone/core/Buffer", "Tone/source/Oscillator", "Tone/instrument/SimpleSynth"], 
function(chai, Tone, Master, Bus, Note, Test, Buffer, Oscillator, SimpleSynth){
	var expect = chai.expect;

	describe("AudioContext", function(){
		this.timeout(3000);

		it ("was created", function(){
			expect(Tone.context).to.be.instanceof(AudioContext);
		});

		it ("has OscillatorNode", function(){
			expect(Tone.context.createOscillator).to.be.instanceof(Function);
		});

		it ("clock running", function(done){
			var interval = setInterval(function(){
				if (Tone.context.currentTime > 0){
					clearInterval(interval);
					done();
				}
			}, 20);
		});

		it ("has current API", function(){
			expect(OscillatorNode.prototype.start).to.be.instanceof(Function);
			expect(AudioBufferSourceNode.prototype.start).to.be.instanceof(Function);
			expect(AudioContext.prototype.createGain).to.be.instanceof(Function);
		});

	});

	describe("Tone", function(){

		var tone = new Tone();

		after(function(){
			tone.dispose();
		});

		it("can be created and disposed", function(){
			var t = new Tone();
			t.dispose();
			Test.wasDisposed(t);
		});

		it("correctly calculates samples to seconds", function(){
			var sampleRate = tone.context.sampleRate;
			expect(tone.samplesToSeconds(100)).to.equal(100/sampleRate);
			expect(tone.samplesToSeconds(800)).to.equal(800/sampleRate);
		});

		it("can convert gain to db", function(){
			expect(tone.gainToDb(0)).to.equal(-Infinity);
			expect(tone.gainToDb(1)).is.closeTo(0, 0.1);
			expect(tone.gainToDb(0.5)).is.closeTo(-6, 0.1);
		});

		it("can convert db to gain", function(){
			expect(tone.dbToGain(0)).is.closeTo(1, 0.1);
			expect(tone.dbToGain(-12)).is.closeTo(0.25, 0.1);
			expect(tone.dbToGain(-24)).is.closeTo(0.125, 0.1);
		});

		it("can convert back and forth between db and gain representations", function(){
			expect(tone.dbToGain(tone.gainToDb(0))).is.closeTo(0, 0.01);
			expect(tone.dbToGain(tone.gainToDb(0.5))).is.closeTo(0.5, 0.01);
			expect(tone.gainToDb(tone.dbToGain(1))).is.closeTo(1, 0.01);
		});

		it("returns a default argument when the given is not defined", function(){
			expect(tone.defaultArg(undefined, 0)).is.equal(0);
			expect(tone.defaultArg(undefined, "also")).is.equal("also");
			expect(tone.defaultArg("hihi", 100)).is.equal("hihi");
		});

		it("handles default arguments on an object", function(){
			expect(tone.defaultArg({"b" : 10}, {"a" : 4, "b" : 10})).has.property("a", 4);
			expect(tone.defaultArg({"b" : 10}, {"a" : 4, "b" : 10})).has.property("b", 10);
			expect(tone.defaultArg({"b" : {"c" : 10}}, {"b" : {"c" : 20}})).has.deep.property("b.c", 10);
			expect(tone.defaultArg({"a" : 10}, {"b" : {"c" : 20}})).has.deep.property("b.c", 20);
		});

		it("can connect and disconnect", function(){
			var node = Tone.context.createGain();
			tone.connect(node, 0, 0);
			tone.disconnect();
		});

		it("can chain connections", function(done){
			var node0, node1, node2;
			Test.passesAudio(function(input, output){
				node0 = new Tone(1, 1);
				//internal connection
				node0.input.connect(node0.output);
				//two other nodes to pass audio through
				node1 = Tone.context.createGain();
				node2 = Tone.context.createGain();
				input.connect(node0);
				node0.chain(node1, node2, output);
			}, function(){
				node0.dispose();
				node1.disconnect();
				node2.disconnect();
				done();
			});
		});

		it("can fan connections", function(done){
			var node0, node1, node2;
			Test.passesAudio(function(input, output){
				node0 = new Tone(1, 1);
				//internal connection
				node0.input.connect(node0.output);
				//two other nodes to pass audio through
				node1 = Tone.context.createGain();
				node2 = Tone.context.createGain();
				input.connect(node0);
				node0.fan(node1, node2, output);
			}, function(){
				node0.dispose();
				node1.disconnect();
				node2.disconnect();
				done();
			});
		});
	});

	describe("Tone.prototype.set / get", function(){

		it("sets a value given an object", function(){
			var osc = new Oscillator(0);
			osc.set({
				"frequency" : 30
			});
			expect(osc.frequency.value).to.be.closeTo(30, 0.001);
			osc.dispose();
		});	

		it("sets a value given a string and a value", function(){
			var osc = new Oscillator(0);
			osc.set("frequency", 2);
			expect(osc.frequency.value).to.be.closeTo(2, 0.001);
			osc.dispose();
		});		

		it("ramps to a value given an object and ramp time", function(done){
			var osc;
			var setValue = 30;
			Test.offlineTest(0.6, function(dest){
				osc = new Oscillator(0);
				osc.frequency.connect(dest);
				osc.set({
					"frequency" : setValue
				}, 0.5);
				expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);
			}, function(sample, time){
				if (time > 0.5){
					expect(sample).to.closeTo(setValue, 0.01);
				}
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("ramps to a value given a string and a value and a ramp time", function(done){
			var osc;
			var setValue = 30;
			Test.offlineTest(0.6, function(dest){
				osc = new Oscillator(0);
				osc.frequency.connect(dest);
				osc.set("frequency", setValue, 0.5);
				expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);
			}, function(sample, time){
				if (time > 0.5){
					expect(sample).to.closeTo(setValue, 0.01);
				}
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("gets all defaults of the object with no arguments", function(){
			var osc = new Oscillator(0);
			expect(osc.get()).to.contain.keys(Object.keys(Oscillator.defaults));
			osc.dispose();
		});	

		it("can 'get' only the given keys", function(){
			var osc = new Oscillator(0);
			var keys = ["frequency", "type"];
			expect(Object.keys(osc.get(keys))).to.deep.equal(keys);
			osc.dispose();
		});	

		it("can 'set' a nested object", function(){
			var synth = new SimpleSynth();
			synth.set({
				"oscillator" : {
					"type" : "square2"
				}
			});
			expect(synth.oscillator.type).to.equal("square2");
			synth.dispose();
		});	

		it("can 'set' a value with dot notation", function(){
			var synth = new SimpleSynth();
			synth.set("oscillator.type", "triangle");
			expect(synth.oscillator.type).to.equal("triangle");
			synth.dispose();
		});	

		it("can 'get' a value with dot notation", function(){
			var synth = new SimpleSynth();
			synth.set({
				"oscillator" : {
					"type" : "sine10",
					"phase" : 20,
				}
			});
			expect(synth.get("oscillator.type").oscillator.type).to.equal("sine10");
			//get multiple values
			expect(synth.get(["oscillator.type", "oscillator.phase"])).to.deep.equal({
				"oscillator" : {
					"type" : "sine10",
					"phase" : 20,
				}
			});
			synth.dispose();
		});	

	});

	describe("Tone.Note", function(){

		var tone = new Tone();

		after(function(){
			tone.dispose();
		});

		it("can convert notes into frequencies", function(){
			expect(tone.noteToFrequency("A4")).to.be.closeTo(440, 0.0001);
			expect(tone.noteToFrequency("Bb4")).to.be.closeTo(466.163761, 0.0001);
		});

		it("can convert frequencies into notes", function(){
			expect(tone.frequencyToNote(440)).to.equal("A4");
			expect(tone.frequencyToNote(4978.031739553295)).to.equal("D#8");
		});

		it("can convert note to midi values", function(){
			expect(tone.midiToNote(60)).to.equal("C3");
			expect(tone.midiToNote(61)).to.equal("C#3");
		});

		it("can convert midi values to note names", function(){
			expect(tone.noteToMidi("C3")).to.equal(60);
			expect(tone.noteToMidi("Bb2")).to.equal(58);
			expect(tone.noteToMidi("A#2")).to.equal(58);
		});

		it("can convert semitone intervals to frequency ratios", function(){
			expect(tone.intervalToFrequencyRatio(0)).to.equal(1);
			expect(tone.intervalToFrequencyRatio(12)).to.equal(2);
			expect(tone.intervalToFrequencyRatio(7)).to.be.closeTo(1.5, 0.01);
		});

		it("can convert different representations into frequencies", function(){
			expect(tone.toFrequency("4n")).to.equal(2);
			expect(tone.toFrequency("4hz")).to.equal(4);
			expect(tone.toFrequency("A4")).to.be.closeTo(440, 0.001);
			expect(tone.toFrequency(990)).to.equal(990);
		});
	});

	describe("Tone.Master", function(){
		it ("exists", function(){
			expect(Tone.Master).to.exist;
		});

		it ("provides a toMaster method", function(){
			expect(Tone.prototype.toMaster).is.a("function");
		});
	});

	describe("Tone.Bus", function(){
		it ("provides a send and receive method", function(){
			expect(Tone.prototype.send).is.a("function");
			expect(Tone.prototype.receive).is.a("function");
		});

		it ("passes audio from a send to a receive with the same name", function(done){
			var send, recv;
			Test.passesAudio(function(input, output){
				//make them pass through nodes
				send = new Tone();
				recv = new Tone();
				send.input.connect(send.output);
				recv.input.connect(recv.output);
				input.connect(send);
				recv.connect(output);
				send.send("test");
				recv.receive("test");
			}, function(){
				send.dispose();
				recv.dispose();
				done();
			});
		});		
	});

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

	describe("Tone.setContext", function(){
		it ("can set a new context", function(){
			var origCtx = Tone.context;
			var ctx = new OfflineAudioContext(2, 44100, 44100);
			Tone.setContext(ctx);
			expect(Tone.context).to.equal(ctx);
			expect(Tone.prototype.context).to.equal(ctx);
			//then set it back
			Tone.setContext(origCtx);
			expect(Tone.context).to.equal(origCtx);
			expect(Tone.prototype.context).to.equal(origCtx);
			//and a saftey check
			expect(ctx).to.not.equal(origCtx);
		});
	});

});