define(["helper/Basic", "Test", "Tone/core/Transport", "Tone/type/TransportTime", 
	"Tone/core/Tone", "helper/Offline2"], 
	function (Basic, Test, Transport, TransportTime, Tone, Offline) {

	describe("TransportTime", function(){

		Basic(TransportTime);

		context("Constructor", function(){

			afterEach(function(done){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;
				setTimeout(function(){
					done();
				}, 100);
			});

			it("can be made with or without 'new'", function(){
				var t0 = TransportTime();
				expect(t0).to.be.instanceOf(TransportTime);
				t0.dispose();
				var t1 = new TransportTime();
				expect(t1).to.be.instanceOf(TransportTime);
				t1.dispose();
			});

			it("can pass in a number in the constructor", function(){
				var time = TransportTime(1);
				expect(time).to.be.instanceOf(TransportTime);
				expect(time.eval()).to.equal(Tone.Transport.PPQ * 2);
				time.dispose();
			});

			it("can pass in a string in the constructor", function(){
				var time = TransportTime("1");
				expect(time).to.be.instanceOf(TransportTime);
				expect(time.eval()).to.equal(Tone.Transport.PPQ * 2);
				time.dispose();
			});

			it("can pass in a value and a type", function(){
				expect(TransportTime(4, "m").eval()).to.equal(Tone.Transport.PPQ * 16);
			});

			it("with no arguments evaluates to 0 when the transport is stopped", function(){
				expect(TransportTime().eval()).to.equal(0);
			});

			it("with no arguments evaluates to the current ticks when the transport is started", function(done){
				Tone.Transport.start();
				setTimeout(function(){
					expect(TransportTime().eval()).to.equal(Tone.Transport.ticks);
					Tone.Transport.stop();
					done();
				}, 300);
			});
		});

		context("Quantizes values", function(){

			it("can quantize values", function(){
				expect(TransportTime("4n @ 2n").eval()).to.be.closeTo(Tone.Transport.PPQ, 0.01);
				expect(TransportTime("(1n + 4n) @ 4n").eval()).to.be.closeTo(Tone.Transport.PPQ * 5, 0.01);
				expect(TransportTime("4t").quantize("4n").eval()).to.be.closeTo(Tone.Transport.PPQ, 0.01);
			});

			it("can get the next subdivison when the transport is started", function(done){

				Offline(function(output, test, after){

					Tone.Transport.start();

					after(function(){
						expect(TransportTime("@1m").eval()).to.be.closeTo(4 * Tone.Transport.PPQ, 0.01);
						expect(TransportTime("@(4n + 2n)").eval()).to.be.closeTo(Tone.Transport.PPQ * 3, 0.01);
						expect(TransportTime("@4n").eval()).to.be.closeTo(Tone.Transport.PPQ * 2, 0.01);
						Tone.Transport.stop();
						done();
					});
				}, 0.6);
			});	
		});

		context("Expressions", function(){

			it("evaluates mixed expressions", function(){
				expect(TransportTime("4n * 2").eval()).to.equal(Tone.Transport.PPQ * 2);
				expect(TransportTime("(4n * 2) / 4").eval()).to.equal(Tone.Transport.PPQ / 2);
				expect(TransportTime("0:2 / 2").eval()).to.equal(Tone.Transport.PPQ);
			});
		});

		context("Operators", function(){

			it("can add the current time", function(done){
				Tone.Transport.start();
				setTimeout(function(){
					var now = Tone.Transport.ticks;
					expect(TransportTime("4i").addNow().eval()).to.be.closeTo(4 + now, 0.01);
					expect(TransportTime("2n").addNow().eval()).to.be.closeTo(Tone.Transport.PPQ * 2 + now, 0.01);
					expect(TransportTime("+2n").eval()).to.be.closeTo(Tone.Transport.PPQ * 2 + now, 0.01);
					Tone.Transport.stop();
					done();
				}, 600);
			});

		});

		context("Conversions", function(){

			it("converts time into notation", function(){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(TransportTime("4n").toNotation()).to.equal("4n");
				expect(TransportTime(1.5).toNotation()).to.equal("2n + 4n");
				expect(TransportTime(0).toNotation()).to.equal("0");
				expect(TransportTime("1:2:3").toNotation()).to.equal("1m + 2n + 8n + 16n");
			});

			it ("converts time into samples", function(){
				expect(TransportTime(2).toSamples()).to.equal(2 * Tone.context.sampleRate);
			});

			it ("converts time into frequency", function(){
				expect(TransportTime(2).toFrequency()).to.equal(0.5);
			});

			it ("converts time into seconds", function(){
				expect(TransportTime("2n").toSeconds()).to.equal(1);
			});

			it ("converts time into BarsBeatsSixteenths", function(){
				expect(TransportTime("3:1:3").toBarsBeatsSixteenths()).to.equal("3:1:3");
				expect(TransportTime(2).toBarsBeatsSixteenths()).to.equal("1:0:0");
			});

		});

	});
});