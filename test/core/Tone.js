define(["Test", "Tone/core/Tone", "PassAudio", "Tone/source/Oscillator", "Tone/instrument/SimpleSynth", "Offline"], 
	function (Test, Tone, PassAudio, Oscillator, SimpleSynth, Offline) {

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

		it ("has shimmed API", function(){
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
			PassAudio(function(input, output){
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
			PassAudio(function(input, output){
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

		context("Tone.setContext", function(){

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

		context("Tone.prototype.set / get", function(){

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
				var offline = new Offline(0.6);
				offline.before(function(dest){
					osc = new Oscillator(0);
					osc.frequency.connect(dest);
					osc.set({
						"frequency" : setValue
					}, 0.5);
					expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);
				});
				offline.test(function(sample, time){
					if (time > 0.5){
						expect(sample).to.closeTo(setValue, 0.01);
					}
				});
				offline.after(function(){
					osc.dispose();
					done();
				});
				offline.run();
			});		

			it("ramps to a value given a string and a value and a ramp time", function(done){
				var osc;
				var setValue = 30;
				var offline = new Offline(0.6);
				offline.before(function(dest){
					osc = new Oscillator(0);
					osc.frequency.connect(dest);
					osc.set("frequency", setValue, 0.5);
					expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);
				});
				offline.test(function(sample, time){
					if (time > 0.5){
						expect(sample).to.closeTo(setValue, 0.01);
					}
				});
				offline.after(function(){
					osc.dispose();
					done();
				});
				offline.run();
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
	});

});