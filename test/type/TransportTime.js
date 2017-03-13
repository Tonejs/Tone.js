define(["helper/Basic", "Test", "Tone/type/TransportTime", 
	"Tone/core/Tone", "helper/Offline"], 
	function (Basic, Test, TransportTime, Tone, Offline) {

	describe("TransportTime", function(){

		Basic(TransportTime);

		context("Constructor", function(){

			it("can be made with or without 'new'", function(){
				var t0 = TransportTime();
				expect(t0).to.be.instanceOf(TransportTime);
				t0.dispose();
				var t1 = new TransportTime();
				expect(t1).to.be.instanceOf(TransportTime);
				t1.dispose();
			});

			it("can pass in a number in the constructor", function(){
				return Offline(function(Transport){
					var time = TransportTime(1);
					expect(time).to.be.instanceOf(TransportTime);
					expect(time.valueOf()).to.equal(Transport.PPQ * 2);
					time.dispose();
				});
			});

			it("can pass in a string in the constructor", function(){
				return Offline(function(Transport){
					var time = TransportTime("1");
					expect(time).to.be.instanceOf(TransportTime);
					expect(time.valueOf()).to.equal(Transport.PPQ * 2);
					time.dispose();
				});
			});

			it("can pass in a value and a type", function(){
				return Offline(function(Transport){
					expect(TransportTime(4, "m").valueOf()).to.equal(Transport.PPQ * 16);
				});
			});

			it("with no arguments evaluates to 0 when the transport is stopped", function(){
				return Offline(function(){
					expect(TransportTime().valueOf()).to.equal(0);
				});
			});

			it("with no arguments evaluates to the current ticks when the transport is started", function(){
				return Offline(function(Transport){
					Transport.start();
					return Test.atTime(0.29, function(){
						expect(TransportTime().valueOf()).to.equal(Transport.ticks);
						Transport.stop();
					});
				}, 0.3);
			});

			it("is evaluated in equations and comparisons using valueOf", function(){
				expect(TransportTime("1i") + 1).to.equal(2);
				expect(TransportTime("1i") + TransportTime("1i")).to.equal(2);
				expect(TransportTime("1i") > TransportTime(0)).to.be.true;
				expect(+TransportTime("1i")).to.equal(1);
			});
		});

		context("Quantizes values", function(){

			it("can quantize values", function(){
				return Offline(function(Transport){
					expect(TransportTime("4n @ 2n").valueOf()).to.be.closeTo(Transport.PPQ, 0.01);
					expect(TransportTime("(1n + 4n) @ 4n").valueOf()).to.be.closeTo(Transport.PPQ * 5, 0.01);
					expect(TransportTime("4t").quantize("4n").valueOf()).to.be.closeTo(Transport.PPQ, 0.01);
				});
			});

			it("can get the next subdivison when the transport is started", function(){
				return Offline(function(Transport){
					Transport.start();
					return Test.atTime(0.59, function(){
						expect(TransportTime("@1m").valueOf()).to.be.closeTo(4 * Transport.PPQ, 0.01);
						expect(TransportTime("@(4n + 2n)").valueOf()).to.be.closeTo(Transport.PPQ * 3, 0.01);
						expect(TransportTime("@4n").valueOf()).to.be.closeTo(Transport.PPQ * 2, 0.01);
					});
				}, 0.6);
			});	
		});

		context("Expressions", function(){

			it("evaluates mixed expressions", function(){
				return Offline(function(Transport){
					expect(TransportTime("4n * 2").valueOf()).to.equal(Transport.PPQ * 2);
					expect(TransportTime("(4n * 2) / 4").valueOf()).to.equal(Transport.PPQ / 2);
					expect(TransportTime("0:2 / 2").valueOf()).to.equal(Transport.PPQ);
				});
			});
		});

		context("Operators", function(){

			it("can add the current time", function(){
				return Offline(function(Transport){
					Transport.start();
					return Test.atTime(0.59, function(){
						var now = Transport.ticks;
						expect(TransportTime("4i").addNow().valueOf()).to.be.closeTo(4 + now, 0.01);
						expect(TransportTime("2n").addNow().valueOf()).to.be.closeTo(Transport.PPQ * 2 + now, 0.01);
						expect(TransportTime("+2n").valueOf()).to.be.closeTo(Transport.PPQ * 2 + now, 0.01);
						Transport.stop();
					}, 0.6);
				});
			});

		});

		context("Conversions", function(){

			it("converts time into notation", function(){
				return Offline(function(Transport){
					Transport.bpm.value = 120;
					Transport.timeSignature = 4;
					expect(TransportTime("4n").toNotation()).to.equal("4n");
					expect(TransportTime(1.5).toNotation()).to.equal("2n + 4n");
					expect(TransportTime(0).toNotation()).to.equal("0");
					expect(TransportTime("1:2:3").toNotation()).to.equal("1m + 2n + 8n + 16n");
				});
			});

			it ("converts time into samples", function(){
				return Offline(function(){
					expect(TransportTime(2).toSamples()).to.equal(2 * Tone.context.sampleRate);
				});
			});

			it ("converts time into frequency", function(){
				return Offline(function(){
					expect(TransportTime(2).toFrequency()).to.equal(0.5);
				});
			});

			it ("converts time into seconds", function(){
				return Offline(function(){
					expect(TransportTime("2n").toSeconds()).to.equal(1);
				});
			});

			it ("converts time into BarsBeatsSixteenths", function(){
				return Offline(function(){
					expect(TransportTime("3:1:3").toBarsBeatsSixteenths()).to.equal("3:1:3");
					expect(TransportTime(2).toBarsBeatsSixteenths()).to.equal("1:0:0");
				});
			});

		});

	});
});