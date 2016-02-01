define(["Tone/component/Envelope", "helper/Basic", "helper/Offline", "Test"], 
function (Envelope, Basic, Offline, Test) {
	describe("Envelope", function(){

		Basic(Envelope);

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
						expect(sample).to.be.within(env.sustain, 1);
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
				var env = new Envelope(0.1, 0.2, 1).noGC();
				expect(env.value).to.be.closeTo(0, 0.01);
				env.triggerAttack();
				setTimeout(function(){
					expect(env.value).to.be.closeTo(1, 0.01);
					env.dispose();
					done();
				}, 200);
			});
		});
	});
});