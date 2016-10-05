define(["helper/Basic", "Test", "Tone/core/Transport", "Tone/type/Time", "Tone/core/Tone", "helper/Offline2"], 
	function (Basic, Test, Transport, Time, Tone, Offline) {

	describe("Time", function(){

		Basic(Time);

		context("Constructor", function(){

			it("can be made with or without 'new'", function(){
				var t0 = Time();
				expect(t0).to.be.instanceOf(Time);
				t0.dispose();
				var t1 = new Time();
				expect(t1).to.be.instanceOf(Time);
				t1.dispose();
			});

			it("can pass in a number in the constructor", function(){
				var time = Time(1);
				expect(time.eval()).to.equal(1);
				expect(time).to.be.instanceOf(Time);
				time.dispose();
			});

			it("can pass in a string in the constructor", function(){
				var time = Time("1");
				expect(time.eval()).to.equal(1);
				expect(time).to.be.instanceOf(Time);
				time.dispose();
			});

			it("can pass in a value and a type", function(){
				expect(Time(4, "m").eval()).to.equal(8);
			});

			it("with no arguments evaluates to 'now'", function(){
				var now = Tone.now();
				expect(Time().eval()).to.be.closeTo(now, 0.01);
			});
		});

		context("Copy/Clone/Set", function(){

			it("can set a new value", function(){
				var time = new Time(1);
				expect(time.eval()).to.equal(1);
				time.set(2);
				expect(time.eval()).to.equal(2);
			});

			it("can clone a Time", function(){
				var time = new Time("+1");
				var cloned = time.clone();
				expect(cloned).to.not.equal(time);
				expect(cloned).to.be.instanceOf(Time);
				var now = time.now();
				expect(time.eval()).to.be.closeTo(1 + now, 0.01);
				expect(cloned.eval()).to.be.closeTo(1 + now, 0.01);
			});

			it("the clone is not modified when the original is", function(){
				var time = new Time(1);
				var cloned = time.clone();				
				expect(time.eval()).to.equal(1);
				expect(cloned.eval()).to.equal(1);
				time.add(1);
				expect(time.eval()).to.equal(2);
				expect(cloned.eval()).to.equal(1);
				time.set(3);
				expect(time.eval()).to.equal(3);
				expect(cloned.eval()).to.equal(1);
			});

			it("can copy values from another Time", function(){
				var time = new Time(2);
				var copy = new Time(1);	
				expect(time.eval()).to.equal(2);
				expect(copy.eval()).to.equal(1);
				copy.copy(time);
				expect(time.eval()).to.equal(2);
				expect(copy.eval()).to.equal(2);
			});
		});

		context("Quantizes values", function(){

			it("returns the time quantized to the a subdivision", function(){
				expect(Time(1.1).quantize(0.5).eval()).to.be.closeTo(1, 0.01);
				expect(Time(2.3).quantize(0.5).eval()).to.be.closeTo(2.5, 0.01);
				expect(Time(0).quantize(4).eval()).to.be.closeTo(0, 0.01);
			});

			it("can quantize with a percentage", function(){
				expect(Time(4).quantize(8, 0.5).eval()).to.equal(6);
				expect(Time(10).quantize(8, 0.5).eval()).to.equal(9);
				expect(Time(2).quantize(8, 0.75).eval()).to.equal(0.5);
			});
			
			it("can get the next subdivison when the transport is started", function(done){

				Offline(function(dest, testFn, after){
					Tone.Transport.start(0);
					after(function(){
						expect(Time("@1m").eval()).to.be.closeTo(2, 0.01);
						expect(Time("@(4n + 2n)").eval()).to.be.closeTo(1.5, 0.01);
						expect(Time("@4n").eval()).to.be.closeTo(1, 0.01);
						Tone.Transport.stop();
						done();
					});
				}, 0.6);
			});	
		});

		context("Operators", function(){

			it("can add the current time", function(){
				var now = Tone.now();
				expect(Time(4).addNow().eval()).to.be.closeTo(4 + now, 0.01);
				expect(Time("2n").addNow().eval()).to.be.closeTo(1 + now, 0.01);
				expect(Time("+2n").eval()).to.be.closeTo(1 + now, 0.01);
			});

			it("can quantize the value", function(){
				expect(Time(4).quantize(3).eval()).to.equal(3);
				expect(Time(5).quantize(3).eval()).to.equal(6);
			});

		});

		context("Expressions", function(){

			it("evaluates mixed expressions", function(){
				expect(Time("4n * 2").eval()).to.equal(1);
				expect(Time("(4n * 2) / 4").eval()).to.equal(0.25);
				expect(Time("0:2 / 2").eval()).to.equal(0.5);
			});
		});

		context("Conversions", function(){

			it("converts time into notation", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(Time("4n").toNotation()).to.equal("4n");
				expect(Time(1.5).toNotation()).to.equal("2n + 4n");
				expect(Time(0).toNotation()).to.equal("0");
				expect(Time("1:2:3").toNotation()).to.equal("1m + 2n + 8n + 16n");
			});

			it("toNotation works with triplet notation", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 5;
				expect(Time("1m + 8t").toNotation()).to.equal("1m + 8t");
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
			});

			it ("converts time into milliseconds", function(){
				expect(Time(2).toMilliseconds()).to.equal(2000);
				expect(Time("4n").toMilliseconds()).to.equal(500);
			});

			it ("converts time into samples", function(){
				expect(Time(2).toSamples()).to.equal(2 * Tone.context.sampleRate);
			});

			it ("converts time into frequency", function(){
				expect(Time(2).toFrequency()).to.equal(0.5);
			});

			it ("converts time into ticks", function(){
				expect(Time("2n").toTicks()).to.equal(2 * Tone.Transport.PPQ);
			});

			it ("converts time into BarsBeatsSixteenths", function(){
				expect(Time("3:1:3").toBarsBeatsSixteenths()).to.equal("3:1:3");
				expect(Time(2).toBarsBeatsSixteenths()).to.equal("1:0:0");
			});

		});

	});
});