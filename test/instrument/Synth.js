define(["Tone/instrument/Synth", "helper/Basic", "helper/InstrumentTests", "helper/APITest", "helper/Offline", "Tone/type/Frequency"],
	function (Synth, Basic, InstrumentTest, APITest, Offline, Frequency) {

		describe("Synth", function(){

			Basic(Synth);
			InstrumentTest(Synth, "C4");

			context("API", function(){

				it("can get and set oscillator attributes", function(){
					var simple = new Synth();
					simple.oscillator.type = "triangle";
					expect(simple.oscillator.type).to.equal("triangle");
					simple.dispose();
				});

				it("can get and set envelope attributes", function(){
					var simple = new Synth();
					simple.envelope.attack = 0.24;
					expect(simple.envelope.attack).to.equal(0.24);
					simple.dispose();
				});

				it("can be constructed with an options object", function(){
					var simple = new Synth({
						"envelope" : {
							"sustain" : 0.3
						}
					});
					expect(simple.envelope.sustain).to.equal(0.3);
					simple.dispose();
				});

				it("can get/set attributes", function(){
					var simple = new Synth();
					simple.set({
						"envelope.decay" : 0.24
					});
					expect(simple.get().envelope.decay).to.equal(0.24);
					simple.dispose();
				});

				it("can be trigged with a Tone.Frequency", function(){
					return Offline(function(){
						var synth = new Synth().toMaster();
						synth.triggerAttack(Frequency("C4"), 0);
					}).then(function(buffer){
						expect(buffer.isSilent()).to.be.false;
					});
				});

				APITest.method(Synth, "triggerAttack", ["Frequency", "Time=", "NormalRange="]);
				APITest.method(Synth, "triggerRelease", ["Time="]);
				APITest.method(Synth, "triggerAttackRelease", ["Frequency", "Time=", "Time=", "NormalRange="]);

			});

			context("Portamento", function(){
				it("can play notes with a portamento", function(){
					return Offline(function(){
						var synth = new Synth({
							"portamento" : 0.1
						});
						expect(synth.portamento).to.equal(0.1);
						synth.frequency.toMaster();
						synth.triggerAttack(880, 0);
					}, 0.2).then(function(buffer){
						buffer.forEach(function(val, time){
							if (time < 0.1){
								expect(val).to.not.equal(880);
							} else {
								expect(val).to.be.closeTo(880, 1);
							}
						});
					});
				});
			});
		});
	});
