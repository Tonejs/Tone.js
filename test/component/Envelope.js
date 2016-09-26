define(["Tone/component/Envelope", "helper/Basic", "helper/Offline", "Test", 
	"helper/Offline2", "helper/Supports", "helper/PassAudio", "helper/APITest"], 
function (Envelope, Basic, Offline, Test, Offline2, Supports, PassAudio, APITest) {
	describe("Envelope", function(){

		Basic(Envelope);

		context("API", function(){

			APITest.constructor(Envelope, {
				"attack" : "Time=",
				"decay" : "Time=",
				"sustain" : "NormalRange=",
				"release" : "Time=",
				"attackCurve" : ["linear", "exponential"],
				"releaseCurve" : ["linear", "exponential"]
			});
			APITest.constructor(Envelope, ["Time=", "Time=", "NormalRange=", "Time="]);

			APITest.method(Envelope, "triggerAttack", ["Time=", "NormalRange="]);
			APITest.method(Envelope, "triggerRelease", ["Time="]);
		});

		context("Envelope", function(){


			it("has an output connections", function(){
				var env = new Envelope();
				env.connect(Test);
				env.dispose();
			});

			it ("can get and set values an Objects", function(){
				var env = new Envelope();
				var values = {
					"attack" : 0,
					"decay" : 0.5,
					"sustain" : 1,
					"release" : "4n"
				};
				env.set(values);
				expect(env.get()).to.contain.keys(Object.keys(values));
				env.dispose();
			});

			it ("passes no signal before being triggered", function(done){
				var env;
				var offline = new Offline(0.1);
				offline.before(function(dest){
					env = new Envelope().connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(0);
				});
				offline.after(function(){
					env.dispose();
					done();
				});
				offline.run();
			});

			if (Supports.ACCURATE_SIGNAL_SCHEDULING){

				it ("passes signal once triggered", function(done){
					var env;
					var offline = new Offline(0.2);
					offline.before(function(dest){
						env = new Envelope().connect(dest);
						env.triggerAttack(0.1);
					});
					offline.test(function(sample, time){
						if (time <= 0.1){
							expect(sample).to.equal(0);
						} else {
							expect(sample).to.be.above(0);
						}
					});
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});
			}

			it ("can take parameters as both an object and as arguments", function(){
				var env0 = new Envelope({
					"attack" : 0,
					"decay" : 0.5,
					"sustain" : 1
				});
				expect(env0.attack).to.equal(0);
				expect(env0.decay).to.equal(0.5);
				expect(env0.sustain).to.equal(1);
				env0.dispose();
				var env1 = new Envelope(0.1, 0.2, 0.3);
				expect(env1.attack).to.equal(0.1);
				expect(env1.decay).to.equal(0.2);
				expect(env1.sustain).to.equal(0.3);
				env1.dispose();
			});


			it("can set attack to exponential or linear", function(){
				var env = new Envelope(0.01, 0.01, 0.5, 0.3);
				env.attackCurve = "exponential";
				expect(env.attackCurve).to.equal("exponential");
				env.triggerAttack();
				env.dispose();
				//and can be linear
				var env2 = new Envelope(0.01, 0.01, 0.5, 0.3);
				env2.attackCurve = "linear";
				expect(env2.attackCurve).to.equal("linear");
				env2.triggerAttack();
				//and test a non-curve
				expect(function(){
					env2.attackCurve = "other";
				}).to.throw(Error);
				env2.dispose();
			});

			it("can set release to exponential or linear", function(){
				var env = new Envelope(0.01, 0.01, 0.5, 0.3);
				env.releaseCurve = "exponential";
				expect(env.releaseCurve).to.equal("exponential");
				env.triggerRelease();
				env.dispose();
				//and can be linear
				var env2 = new Envelope(0.01, 0.01, 0.5, 0.3);
				env2.releaseCurve = "linear";
				expect(env2.releaseCurve).to.equal("linear");
				env2.triggerRelease();
				//and test a non-curve
				expect(function(){
					env2.releaseCurve = "other";
				}).to.throw(Error);
				env2.dispose();
			});

			if (Supports.ACCURATE_SIGNAL_SCHEDULING){

				it ("correctly schedules an exponential attack", function(done){
					var env;
					var offline = new Offline(0.7); 
					offline.before(function(dest){
						env = new Envelope(0.01, 0.4, 0.5, 0.1);
						env.attackCurve = "exponential";
						env.connect(dest);
						env.triggerAttack(0);
					});
					offline.test(function(sample, time){
						if (time < env.attack){
							expect(sample).to.be.within(0, 1);
						} else if (time < env.attack + env.decay){
							expect(sample).to.be.within(env.sustain - 0.001, 1);
						} else {
							expect(sample).to.be.closeTo(env.sustain, 0.01);
						} 
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});
			}



			it ("correctly schedules a linear release", function(done){
				var env;
				var offline = new Offline(0.4); 
				offline.before(function(dest){
					env = new Envelope(0.1, 0.01, 1, 0.1);
					env.releaseCurve = "linear";
					env.connect(dest);
					env.triggerAttackRelease(0.2, 0);
				});
				offline.test(function(sample, time){
					if (time > 0.2 && time <= 0.3){
						var target = 1 - (time - 0.2) * 10;
						expect(sample).to.be.closeTo(target, 0.01);
					} 
				}); 
				offline.after(function(){
					env.dispose();
					done();
				});
				offline.run();
			});

			if (Supports.ACCURATE_SIGNAL_SCHEDULING){

				it ("can schedule a very short attack", function(done){
					var env;
					var offline = new Offline(0.2); 
					offline.before(function(dest){
						env = new Envelope(0.001, 0.001, 0);
						env.connect(dest);
						env.triggerAttack(0);
					});
					offline.test(function(sample, time){
						if (time < env.attack){
							expect(sample).to.be.within(0, 1);
						} else if (time < env.attack + env.decay){
							expect(sample).to.be.within(0, 1);
						} else {
							expect(sample).to.be.below(0.02);
						} 
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("correctly schedule a release", function(done){
					var releaseTime = 0.2;
					var env;
					var offline = new Offline(0.7); 
					offline.before(function(dest){
						env = new Envelope(0.001, 0.001, 0.5, 0.3);
						env.connect(dest);
						env.triggerAttack(0);
						env.triggerRelease(releaseTime);
					});
					offline.test(function(sample, time){
						if (time > env.attack + env.decay && time < env.attack + env.decay + releaseTime){
							expect(sample).to.be.below(env.sustain + 0.01);
						} else if (time > 0.5){
							//silent
							expect(sample).to.be.below(0.01);
						}
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});
			}

			it ("is silent before and after triggering", function(done){
				var releaseTime = 0.2;
				var attackTime = 0.1;
				var env;
				var offline = new Offline(0.7); 
				offline.before(function(dest){
					env = new Envelope(0.001, 0.001, 0.5, 0.01);
					env.connect(dest);
					env.triggerAttack(attackTime);
					env.triggerRelease(releaseTime);
				});
				offline.test(function(sample, time){
					if (time < attackTime){
						expect(sample).to.equal(0);
					} else if (time > env.attack + env.decay + releaseTime + env.release){
						expect(sample).to.equal(0);
					}
				}); 
				offline.after(function(){
					env.dispose();
					done();
				});
				offline.run();
			});

			if (Supports.ACCURATE_SIGNAL_SCHEDULING){

				it ("is silent after decay if sustain is 0", function(done){
					var attackTime = 0.1;
					var env;
					var offline = new Offline(0.7); 
					offline.before(function(dest){
						env = new Envelope(0.001, 0.01, 0.0);
						env.connect(dest);
						env.triggerAttack(attackTime);
					});
					offline.test(function(sample, time){
						if (time < attackTime){
							expect(sample).to.equal(0);
						} else if (time > attackTime + env.attack + env.decay + 0.0001){
							expect(sample).to.equal(0);
						}
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("correctly schedule an attack release envelope", function(done){
					var env;
					var releaseTime = 0.4;
					var offline = new Offline(0.8); 
					offline.before(function(dest){
						env = new Envelope(0.08, 0.2, 0.1, 0.2);
						env.connect(dest);
						env.triggerAttack(0);
						env.triggerRelease(releaseTime);
					});
					offline.test(function(sample, time){
						if (time < env.attack){
							expect(sample).to.be.within(0, 1);
						} else if (time < env.attack + env.decay){
							expect(sample).to.be.within(env.sustain, 1);
						} else if (time < releaseTime){
							expect(sample).to.be.closeTo(env.sustain, 0.1);
						} else if (time < releaseTime + env.release){
							expect(sample).to.be.within(0, env.sustain + 0.01);
						} else {
							//silent
							expect(sample).to.be.below(0.01);
						}
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("can schedule a combined AttackRelease", function(done){
					var env;
					var duration = 0.4;
					var offline = new Offline(0.7); 
					offline.before(function(dest){
						env = new Envelope(0.1, 0.2, 0.35, 0.1);
						env.connect(dest);
						env.triggerAttackRelease(duration, 0);
					}); 
					offline.test(function(sample, time){
						if (time < env.attack){
							expect(sample).to.be.within(0, 1);
						} else if (time < env.attack + env.decay){
							expect(sample).to.be.within(env.sustain - 0.001, 1);
						} else if (time < duration){
							expect(sample).to.be.closeTo(env.sustain, 0.1);
						} else if (time < duration + env.release){
							expect(sample).to.be.within(0, env.sustain + 0.01);
						} else {
							expect(sample).to.be.below(0.01);
						}
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("can schedule a combined AttackRelease with velocity", function(done){
					var env;
					var duration = 0.4;
					var velocity = 0.4;
					var offline = new Offline(0.8); 
					offline.before(function(dest){
						env = new Envelope(0.1, 0.2, 0.35, 0.1);
						env.connect(dest);
						env.triggerAttackRelease(duration, 0, velocity);
					});
					offline.test(function(sample, time){
						if (time < env.attack){
							expect(sample).to.be.within(0, velocity + 0.01);
						} else if (time < env.attack + env.decay){
							expect(sample).to.be.within(env.sustain * velocity - 0.01, velocity + 0.01);
						} else if (time < duration){
							expect(sample).to.be.closeTo(env.sustain * velocity, 0.1);
						} else if (time < duration + env.release){
							expect(sample).to.be.within(0, env.sustain * velocity + 0.01);
						} else {
							expect(sample).to.be.below(0.01);
						}
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("can schedule multiple envelopes", function(done){
					var env;
					var offline = new Offline(1); 
					offline.before(function(dest){
						env = new Envelope(0.1, 0.2, 0);
						env.connect(dest);
						env.triggerAttack(0);
						env.triggerAttack(0.5);
					});
					offline.test(function(sample, time){
						if (time > 0 && time < 0.3){
							expect(sample).to.be.above(0);
						} else if (time < 0.5){
							expect(sample).to.be.below(0.02);
						} else if (time > 0.5 && time < 0.8){
							expect(sample).to.be.above(0);
						} 
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("can schedule multiple attack/releases with no discontinuities", function(done){
					var env;
					var offline = new Offline(2); 
					offline.before(function(dest){
						env = new Envelope(0.1, 0.2, 0.2, 0.4);
						env.connect(dest);
						env.triggerAttackRelease(0.4, 0);
						env.triggerAttackRelease(0.11, 0.4);
						env.triggerAttackRelease(0.1, 0.45);
						env.triggerAttackRelease(0.09, 1.1);
						env.triggerAttackRelease(0.3, 1.5);
						env.triggerAttackRelease(0.29, 1.8);
					});
					//test for discontinuities
					var lastSample = 0;
					offline.test(function(sample){
						expect(sample).to.be.at.most(1);
						var diff = Math.abs(lastSample - sample);
						expect(diff).to.be.lessThan(0.001);
						lastSample = sample;
					}); 
					offline.after(function(){
						env.dispose();
						done();
					});
					offline.run();
				});

				it ("reports its current envelope value (.value)", function(done){
					Offline2(function(output, test, after){

						var env = new Envelope(0.1, 0.2, 1).connect(output);

						expect(env.value).to.be.closeTo(0, 0.01);

						env.triggerAttack();

						test(function(sample){
							expect(env.value).to.be.closeTo(sample, 0.01);
						});

						after(function(){
							env.dispose();
							done();
						});

					}, 0.3);
				});
			}


			it ("can cancel a schedule envelope", function(done){
				Offline2(function(output, test, after){
					var env = new Envelope(0.1, 0.2, 1).connect(output);

					env.triggerAttack(0.2);
					env.cancel(0.2);

					test(function(sample){
						expect(sample).to.equal(0);
					});	

					after(function(){
						env.dispose();
						done();
					});
				}, 0.3);
			});
		});

		context("Attack/Release Curves", function(){

			it ("can get set all of the types as the attackCurve", function(){

				var env = new Envelope();

				for (var type in Envelope.Type){
					env.attackCurve = type;
					expect(env.attackCurve).to.equal(type);
				}
				env.dispose();
			});

			it ("can get set all of the types as the releaseCurve", function(){

				var env = new Envelope();

				for (var type in Envelope.Type){
					env.releaseCurve = type;
					expect(env.releaseCurve).to.equal(type);
				}
				env.dispose();
			});

			it ("outputs a signal when the attack/release curves are set to 'bounce'", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : "bounce",
						releaseCurve : "bounce",
					}).connect(output);

					env.triggerAttackRelease(0.3, 0.1);

					test(function(sample, time){
						if (time > 0.1 && time < 0.7){
							expect(sample).to.be.above(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("outputs a signal when the attack/release curves are set to 'ripple'", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : "ripple",
						releaseCurve : "ripple",
					}).connect(output);

					env.triggerAttackRelease(0.3, 0.1);

					test(function(sample, time){
						if (time > 0.1 && time < 0.7){
							expect(sample).to.be.above(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("outputs a signal when the attack/release curves are set to 'sine'", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : "sine",
						releaseCurve : "sine",
					}).connect(output);

					env.triggerAttackRelease(0.3, 0.1);

					test(function(sample, time){
						if (time > 0.1 && time < 0.7){
							expect(sample).to.be.above(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("outputs a signal when the attack/release curves are set to 'cosine'", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : "cosine",
						releaseCurve : "cosine",
					}).connect(output);

					env.triggerAttackRelease(0.3, 0.1);

					test(function(sample, time){
						if (time > 0.1 && time < 0.7){
							expect(sample).to.be.above(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("outputs a signal when the attack/release curves are set to 'step'", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : "step",
						releaseCurve : "step",
					}).connect(output);

					env.triggerAttackRelease(0.3, 0.1);

					test(function(sample, time){
						if (time > 0.3 && time < 0.5){
							expect(sample).to.be.above(0);
						} else if (time < 0.1){
							expect(sample).to.equal(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("outputs a signal when the attack/release curves are set to an array", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : [0, 1, 0, 1],
						releaseCurve : [1, 0, 1, 0],
					}).connect(output);

					env.triggerAttackRelease(0.4, 0.1);

					test(function(sample, time){
						if (time > 0.4 && time < 0.5){
							expect(sample).to.be.above(0);
						} else if (time < 0.1){
							expect(sample).to.equal(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("can scale a velocity with a custom curve", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : [0, 1, 0, 1],
						releaseCurve : [1, 0, 1, 0],
					}).connect(output);

					env.triggerAttackRelease(0.4, 0.1, 0.5);

					test(function(sample, time){
						expect(sample).to.be.lte(0.5);
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 0.8);
			});

			it ("can retrigger partial envelope with custom type", function(done){
				Offline2(function(output, test, after){

					var env = new Envelope({
						attack : 0.3,
						sustain : 1,
						release: 0.3,
						decay : 0,
						attackCurve : "step",
						releaseCurve : "step",
					}).connect(output);

					env.triggerAttackRelease(0.3, 0.1);
					env.triggerAttackRelease(0.35, 0.1);
					env.triggerAttackRelease(0.8, 0.1);

					test(function(sample, time){
						if (time > 0.3 && time < 0.5){
							expect(sample).to.be.above(0);
						} else if (time < 0.1){
							expect(sample).to.equal(0);
						}
					});

					after(function(){
						env.dispose();
						done();
					});

				}, 1);
			});
		});
	});
});