define(["Test", "Tone/core/Tone", "helper/PassAudio", "Tone/source/Oscillator", 
	"Tone/instrument/Synth", "helper/Offline2", "helper/Supports"], 
	function (Test, Tone, PassAudio, Oscillator, Synth, Offline, Supports) {

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

		context("Unit Conversions", function(){
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

			it("can convert semitone intervals to frequency ratios", function(){
				expect(tone.intervalToFrequencyRatio(0)).to.equal(1);
				expect(tone.intervalToFrequencyRatio(12)).to.equal(2);
				expect(tone.intervalToFrequencyRatio(7)).to.be.closeTo(1.5, 0.01);
			});
		});

		context("Type checking", function(){

			it("can test if an argument is a undefined", function(){
				expect(tone.isUndef(undefined)).to.be.true;
				expect(tone.isUndef("seomthing")).to.be.false;
				expect(tone.isUndef({})).to.be.false;
			});

			it("can test if an argument is a function", function(){
				expect(tone.isFunction(undefined)).to.be.false;
				expect(tone.isFunction(function(){})).to.be.true;
				expect(tone.isFunction(Tone)).to.be.true;
			});

			it("can test if an argument is a number", function(){
				expect(tone.isNumber(undefined)).to.be.false;
				expect(tone.isNumber(function(){})).to.be.false;
				expect(tone.isNumber(Tone)).to.be.false;
				expect(tone.isNumber(10)).to.be.true;
				expect(tone.isNumber("10")).to.be.false;
			});

			it("can test if an argument is an object literal", function(){
				expect(tone.isObject(Number)).to.be.false;
				expect(tone.isObject(function(){})).to.be.false;
				expect(tone.isObject(tone)).to.be.false;
				expect(tone.isObject({})).to.be.true;
				expect(tone.isObject([])).to.be.false;
				expect(tone.isObject("10")).to.be.false;
			});

			it("can test if an argument is an array", function(){
				expect(tone.isArray(Number)).to.be.false;
				expect(tone.isArray({})).to.be.false;
				expect(tone.isArray([])).to.be.true;
			});

			it("can test if an argument is a boolean", function(){
				expect(tone.isBoolean(Number)).to.be.false;
				expect(tone.isBoolean(true)).to.be.true;
				expect(tone.isBoolean(false)).to.be.true;
				expect(tone.isBoolean([])).to.be.false;
			});

			it("can test if an argument is a string", function(){
				expect(tone.isString(Number)).to.be.false;
				expect(tone.isString(true)).to.be.false;
				expect(tone.isString("false")).to.be.true;
				expect(tone.isString("thanks")).to.be.true;
			});
		});

		context("defaultArg", function(){

			it("returns a default argument when the given is not defined", function(){
				expect(tone.defaultArg(undefined, 0)).is.equal(0);
				expect(tone.defaultArg(undefined, "also")).is.equal("also");
				expect(tone.defaultArg("hihi", 100)).is.equal("hihi");
			});

			it("handles default arguments on a shallow object", function(){
				expect(tone.defaultArg({"b" : 10}, {"a" : 4, "b" : 10})).has.property("a", 4);
				expect(tone.defaultArg({"b" : 10, "c" : 20}, {"a" : 4, "b" : 10})).has.property("b", 10);
				expect(tone.defaultArg({"b" : 10, "c" : 20}, {"a" : 4, "b" : 10})).has.property("c", 20);
			});

			it("handles default arguments on a deep object", function(){
				expect(tone.defaultArg({"b" : {"c" : 10}}, {"b" : {"c" : 20, "d" : 30}})).has.deep.property("b.d", 30);
				expect(tone.defaultArg({"a" : 10}, {"b" : {"c" : 20}})).has.deep.property("b.c", 20);
			});

		});

		context("optionsObject", function(){

			it("maps array parameters to an object", function(){
				expect(tone.optionsObject([1, 2], ["a", "b"])).is.deep.equal({
					"a" : 1,
					"b" : 2
				});
			});

			it("maps array parameters to an object with missing arguments", function(){
				expect(tone.optionsObject([1, 2], ["a", "b", "c"])).is.deep.equal({
					"a" : 1,
					"b" : 2,
					"c" : undefined
				});
			});

			it("gets default arguments after creating options object", function(){
				expect(tone.optionsObject([1, 2], ["a", "b", "c"], {"c" : 3})).is.deep.equal({
					"a" : 1,
					"b" : 2,
					"c" : 3
				});
			});

			it("does not map parameter if first argument is already an object", function(){
				expect(tone.optionsObject([{"a" : 2, "b" : 3}], ["a", "b", "c"])).is.deep.equal({
					"a" : 2,
					"b" : 3,
				});
			});

		});

		context("connections", function(){

			it("can connect and disconnect", function(){
				var node = Tone.context.createGain();
				tone.connect(node, 0, 0);
				tone.disconnect();
			});

			if (Supports.NODE_DISCONNECT){
				it("can disconnect from a specific connection", function(done){
					var node0, node1;
					PassAudio(function(input, output){
						node0 = new Tone(1, 1);
						//internal connection
						node0.input.connect(node0.output);
						//two other nodes to pass audio through
						node1 = Tone.context.createGain();
						input.chain(node0, output);
						//connect and disconnect, shouldn't affect the others
						input.connect(node1);
						input.disconnect(node1);
					}, function(){
						node0.dispose();
						node1.disconnect();
						done();
					});
				});
			}


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
				Offline(function(dest, test, after){
					var osc = new Oscillator(0);
					var setValue = 30;
					osc.frequency.connect(dest);
					osc.set({
						"frequency" : setValue
					}, 0.5);
					expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);

					test(function(sample, time){
						if (time > 0.5){
							expect(sample).to.closeTo(setValue, setValue * 0.1);
						}
					});

					after(function(){
						osc.dispose();
						done();
					});
				}, 0.6);
			});		

			it("ramps to a value given a string and a value and a ramp time", function(done){
				Offline(function(dest, test, after){
					var osc = new Oscillator(0);
					var setValue = 30;
					osc.frequency.connect(dest);
					osc.set("frequency", setValue, 0.5);
					expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);

					test(function(sample, time){
						if (time > 0.5){
							expect(sample).to.closeTo(setValue, setValue * 0.1);
						}
					});

					after(function(){
						osc.dispose();
						done();
					});
				}, 0.6);
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
				var synth = new Synth();
				synth.set({
					"oscillator" : {
						"type" : "square2"
					}
				});
				expect(synth.oscillator.type).to.equal("square2");
				synth.dispose();
			});	

			it("can 'set' a value with dot notation", function(){
				var synth = new Synth();
				synth.set("oscillator.type", "triangle");
				expect(synth.oscillator.type).to.equal("triangle");
				synth.dispose();
			});	

			it("can 'get' a value with dot notation", function(){
				var synth = new Synth();
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