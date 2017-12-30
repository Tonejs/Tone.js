define(["Test", "Tone/core/Tone", "helper/PassAudio", "Tone/source/Oscillator",
	"Tone/instrument/Synth", "helper/Offline",
	"Tone/component/Filter", "Tone/core/Gain", "Tone/core/Context",
	"helper/BufferTest", "Tone/component/Merge", "Tone/signal/Signal", "Tone/component/Split", "helper/Supports"],
function (Test, Tone, PassAudio, Oscillator, Synth, Offline,
	Filter, Gain, Context, BufferTest, Merge, Signal, Split, Supports) {

	describe("Tone", function(){

		it("can be created and disposed", function(){
			var t = new Tone();
			t.dispose();
			Test.wasDisposed(t);
		});

		it("must be invoked with 'new'", function(){
			expect(function(){
				var t = Tone();
			}).to.throw(Error);
		});

		it("returns the class name with toString()", function(){
			var t = new Tone();
			expect(t.toString()).to.equal("Tone");
			t.dispose();
			var g = new Gain();
			expect(g.toString()).to.equal("Gain");
			g.dispose();
		});

		context("Unit Conversions", function(){
			it("can convert gain to db", function(){
				expect(Tone.gainToDb(0)).to.equal(-Infinity);
				expect(Tone.gainToDb(1)).is.closeTo(0, 0.1);
				expect(Tone.gainToDb(0.5)).is.closeTo(-6, 0.1);
			});

			it("can convert db to gain", function(){
				expect(Tone.dbToGain(0)).is.closeTo(1, 0.1);
				expect(Tone.dbToGain(-12)).is.closeTo(0.25, 0.1);
				expect(Tone.dbToGain(-24)).is.closeTo(0.125, 0.1);
			});

			it("can convert back and forth between db and gain representations", function(){
				expect(Tone.dbToGain(Tone.gainToDb(0))).is.closeTo(0, 0.01);
				expect(Tone.dbToGain(Tone.gainToDb(0.5))).is.closeTo(0.5, 0.01);
				expect(Tone.gainToDb(Tone.dbToGain(1))).is.closeTo(1, 0.01);
			});

			it("can convert semitone intervals to frequency ratios", function(){
				expect(Tone.intervalToFrequencyRatio(0)).to.equal(1);
				expect(Tone.intervalToFrequencyRatio(12)).to.equal(2);
				expect(Tone.intervalToFrequencyRatio(7)).to.be.closeTo(1.5, 0.01);
			});
		});

		context("Type checking", function(){

			it("can test if an argument is a undefined", function(){
				expect(Tone.isUndef(undefined)).to.be.true;
				expect(Tone.isUndef("seomthing")).to.be.false;
				expect(Tone.isUndef({})).to.be.false;
			});

			it("can test if an argument is a function", function(){
				expect(Tone.isFunction(undefined)).to.be.false;
				expect(Tone.isFunction(function(){})).to.be.true;
				expect(Tone.isFunction(Tone)).to.be.true;
			});

			it("can test if an argument is a number", function(){
				expect(Tone.isNumber(undefined)).to.be.false;
				expect(Tone.isNumber(function(){})).to.be.false;
				expect(Tone.isNumber(Tone)).to.be.false;
				expect(Tone.isNumber(10)).to.be.true;
				expect(Tone.isNumber("10")).to.be.false;
			});

			it("can test if an argument is an object literal", function(){
				expect(Tone.isObject(Number)).to.be.false;
				expect(Tone.isObject(function(){})).to.be.false;
				expect(Tone.isObject(new Tone())).to.be.false;
				expect(Tone.isObject({})).to.be.true;
				expect(Tone.isObject([])).to.be.false;
				expect(Tone.isObject("10")).to.be.false;
			});

			it("can test if an argument is an array", function(){
				expect(Tone.isArray(Number)).to.be.false;
				expect(Tone.isArray({})).to.be.false;
				expect(Tone.isArray([])).to.be.true;
			});

			it("can test if an argument is a boolean", function(){
				expect(Tone.isBoolean(Number)).to.be.false;
				expect(Tone.isBoolean(true)).to.be.true;
				expect(Tone.isBoolean(false)).to.be.true;
				expect(Tone.isBoolean([])).to.be.false;
			});

			it("can test if an argument is a string", function(){
				expect(Tone.isString(Number)).to.be.false;
				expect(Tone.isString(true)).to.be.false;
				expect(Tone.isString("false")).to.be.true;
				expect(Tone.isString("thanks")).to.be.true;
			});

			it("can test if an argument is a note", function(){
				expect(Tone.isNote(undefined)).to.be.false;
				expect(Tone.isNote(function(){})).to.be.false;
				expect(Tone.isNote(Tone)).to.be.false;
				expect(Tone.isNote("Cb2")).to.be.true;
				expect(Tone.isNote("10")).to.be.false;
				expect(Tone.isNote("C4")).to.be.true;
				expect(Tone.isNote("D4")).to.be.true;
				expect(Tone.isNote("Db4")).to.be.true;
				expect(Tone.isNote("E4")).to.be.true;
				expect(Tone.isNote("Fx2")).to.be.true;
				expect(Tone.isNote("Gbb-1")).to.be.true;
				expect(Tone.isNote("A#10")).to.be.true;
				expect(Tone.isNote("Bb2")).to.be.true;
			});
		});

		context("defaults", function(){

			it("returns a default argument when the given is not defined", function(){
				expect(Tone.defaultArg(undefined, 0)).is.equal(0);
				expect(Tone.defaultArg(undefined, "also")).is.equal("also");
				expect(Tone.defaultArg("hihi", 100)).is.equal("hihi");
			});

			it("handles default arguments on a shallow object", function(){
				expect(Tone.defaultArg({ "b" : 10 }, { "a" : 4, "b" : 10 })).has.property("a", 4);
				expect(Tone.defaultArg({ "b" : 10, "c" : 20 }, { "a" : 4, "b" : 10 })).has.property("b", 10);
				expect(Tone.defaultArg({ "b" : 10, "c" : 20 }, { "a" : 4, "b" : 10 })).has.property("c", 20);
			});

			it("handles default arguments on a deep object", function(){
				expect(Tone.defaultArg({ "b" : { "c" : 10 } }, { "b" : { "c" : 20, "d" : 30 } })).has.deep.property("b.d", 30);
				expect(Tone.defaultArg({ "a" : 10 }, { "b" : { "c" : 20 } })).has.deep.property("b.c", 20);
			});

			it("maps array parameters to an object", function(){
				expect(Tone.defaults([1, 2], ["a", "b"], {})).is.deep.equal({
					"a" : 1,
					"b" : 2
				});
			});

			it("maps array parameters to an object with missing arguments", function(){
				expect(Tone.defaults([1, 2], ["a", "b", "c"], {})).is.deep.equal({
					"a" : 1,
					"b" : 2,
					"c" : undefined
				});
			});

			it("gets default arguments after creating options object", function(){
				var constr = {
					"defaults" : { "c" : 3 }
				};
				expect(Tone.defaults([1, 2], ["a", "b", "c"], constr)).is.deep.equal({
					"a" : 1,
					"b" : 2,
					"c" : 3
				});
			});

			it("uses constr as an object if third argument doesn't have a 'defaults' property", function(){
				expect(Tone.defaults([1, 2], ["a", "b", "c"], { "c" : 3 })).is.deep.equal({
					"a" : 1,
					"b" : 2,
					"c" : 3
				});
			});

			it("does not map parameter if first argument is already an object", function(){
				expect(Tone.defaults([{ "a" : 2, "b" : 3 }], ["a", "b", "c"], {})).is.deep.equal({
					"a" : 2,
					"b" : 3,
				});
			});

		});

		context("Tone.context", function(){

			if (Supports.AUDIO_CONTEXT_CLOSE_RESOLVES){

				it("can set a new context", function(){
					var origCtx = Tone.context;
					var ctx = new Context();
					Tone.context = ctx;
					expect(Tone.context).to.equal(ctx);
					expect(Tone.prototype.context).to.equal(ctx);
					//then set it back
					Tone.setContext(origCtx);
					expect(Tone.context).to.equal(origCtx);
					expect(Tone.prototype.context).to.equal(origCtx);
					return ctx.dispose();
				});

				it("new context can be a raw audio context", function(){
					var origCtx = Tone.context;
					var ctx = new AudioContext();
					Tone.context = ctx;
					//wraps it in a Tone.Context
					expect(Tone.context).to.be.instanceOf(Context);
					//then set it back
					Tone.setContext(origCtx);
					expect(Tone.context).to.equal(origCtx);
					expect(Tone.prototype.context).to.equal(origCtx);
					//and a saftey check
					return ctx.close();
				});
			}

			it("tests if the audio context time has passed", function(){
				// overwrite warn to throw errors
				var originalWarn = console.warn;
				console.warn = function(warning){
					throw new Error(warning);
				};
				var currentTime = Tone.context.currentTime;
				expect(function(){
					Tone.isPast(currentTime-1);
				}).to.throw(Error);
				console.warn = originalWarn;
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

			it("ramps to a value given an object and ramp time", function(){
				return Offline(function(){
					var osc = new Oscillator(0).toMaster();
					var setValue = 30;
					osc.frequency.toMaster();
					osc.set({
						"frequency" : setValue
					}, 0.5);
					expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);

					return function(sample, time){
						if (time > 0.5){
							expect(sample).to.closeTo(setValue, setValue * 0.1);
						}
					};
				});
			});

			it("ramps to a value given a string and a value and a ramp time", function(){
				return Offline(function(){
					var osc = new Oscillator(0).toMaster();
					var setValue = 20;
					osc.frequency.toMaster();
					osc.set("frequency", setValue, 0.2);
					expect(osc.frequency.value).to.not.be.closeTo(setValue, 0.001);
				}).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time > 0.2){
							expect(sample).to.closeTo(setValue, setValue * 0.1);
						}
					});
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
