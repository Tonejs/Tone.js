define(["helper/Basic", "Test", "Tone/core/Transport", "Tone/type/Type", 
	"Tone/type/Time", "Tone/type/Frequency", "Tone/type/TransportTime"], 
	function (Basic, Test, Transport, Tone, Time, Frequency, TransportTime) {

	describe("Type", function(){

		//an instance of tone to test with
		var tone = new Tone();

		context("Tone.toSeconds", function(){

			afterEach(function(done){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;
				setTimeout(function(){
					done();
				}, 100);
			});

			it("correctly infers type", function(){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(tone.toSeconds("5")).to.equal(5);
				expect(tone.toSeconds("1m")).to.equal(2);
				expect(tone.toSeconds("1")).to.equal(1);
				expect(tone.toSeconds("1:0:0")).to.equal(2);
				expect(tone.toSeconds("2hz")).to.equal(0.5);
			});

			it("handles 'now' relative values", function(){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				var now = tone.now();
				expect(tone.toSeconds("+5")).to.be.closeTo(now + 5, 0.05);
				now = tone.now();
				expect(tone.toSeconds("+4n")).to.be.closeTo(now + 0.5, 0.05);
				now = tone.now();
				expect(tone.toSeconds("+1:0")).to.be.closeTo(now + 2, 0.05);
			});

			it("with no arguments returns 'now'", function(){
				var now = tone.now();
				expect(tone.toSeconds()).to.be.closeTo(now, 0.05);
			});

			it("can evaluate mathematical expressions of time", function(){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(tone.toSeconds("1+2+3")).to.equal(6);
				expect(tone.toSeconds("2 * 1:2 - 1m")).to.equal(4);
				expect(tone.toSeconds("(1 + 2) / 4n")).to.equal(6);
				expect(tone.toSeconds("((1) + 2)*4n + 1:0:0")).to.equal(3.5);
			});

			it("can pass in Primitive time types", function(){
				Tone.Transport.stop();
				expect(tone.toSeconds(Time("4n"))).to.equal(0.5);
				expect(tone.toSeconds(Frequency("4n"))).to.equal(0.5);
				expect(tone.toSeconds(TransportTime("4n"))).to.equal(0.5);
			});

		});


		context("Tone.toFrequency", function(){

			it("infers type correctly", function(){
				Tone.Transport.stop();
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(tone.toFrequency("1hz")).to.equal(1);
				expect(tone.toFrequency("4n")).to.equal(2);
				expect(tone.toFrequency(500)).to.equal(500);
			});

			it("evaluates expressions", function(){
				expect(tone.toFrequency("A4 * 3")).to.equal(Tone.Frequency.A4 * 3);
				expect(tone.toFrequency("400 / 2 + 100")).to.equal(300);
			});

			it("can pass in Primitive time types", function(){
				expect(tone.toFrequency(Time("4n"))).to.equal(2);
				expect(tone.toFrequency(Frequency("4n"))).to.equal(2);
				expect(tone.toFrequency(TransportTime("4n"))).to.equal(2);
			});
		});

		context("Tone.toTicks", function(){

			it("converts time into ticks", function(){
				var ppq = Tone.Transport.PPQ;
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(tone.toTicks("1i")).to.equal(1);
				expect(tone.toTicks("4n")).to.equal(ppq);
				expect(tone.toTicks("4n + 8n")).to.equal(ppq * 1.5);
			});

			it("handles now-relative values relative to the Tone.Transports current ticks", function(done){
				var ppq = Tone.Transport.PPQ;
				Tone.Transport.bpm.value = 120;
				Tone.Transport.timeSignature = 4;
				expect(tone.toTicks("+4n")).to.equal(ppq);
				Tone.Transport.start();
				setTimeout(function(){
					var currentTicks = Tone.Transport.ticks;
					expect(tone.toTicks("+4n")).to.equal(ppq + currentTicks);
					Tone.Transport.stop();
					done();
				}, 100);
			});

			it("can pass in Primitive time types", function(){
				expect(tone.toTicks(Time("4n"))).to.equal(Tone.Transport.PPQ);
				expect(tone.toTicks(Frequency("4n"))).to.equal(Tone.Transport.PPQ);
				expect(tone.toTicks(TransportTime("4n"))).to.equal(Tone.Transport.PPQ);
			});
		});
	});
});