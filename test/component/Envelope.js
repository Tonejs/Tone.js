import Envelope from "Tone/component/Envelope";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import PassAudio from "helper/PassAudio";
import APITest from "helper/APITest";
describe("Envelope", function(){

	Basic(Envelope);

	context("API", function(){

		APITest.constructor(Envelope, {
			"attack" : "Time=",
			"decay" : "Time=",
			"sustain" : "NormalRange=",
			"release" : "Time=",
			"attackCurve" : ["linear", "exponential"],
			"releaseCurve" : ["linear", "exponential"],
			"decayCurve" : ["linear", "exponential"]
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

		it("can get and set values an Objects", function(){
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

		it("passes no signal before being triggered", function(){
			return Offline(function(){
				new Envelope().toMaster();
			}).then(function(buffer){
				expect(buffer).to.equal.true;
			});
		});

		it("passes signal once triggered", function(){
			return Offline(function(){
				var env = new Envelope().toMaster();
				env.triggerAttack(0.05);
			}).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.001);
			}, 0.1);
		});

		it("can take parameters as both an object and as arguments", function(){
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

		it("can set decay to exponential or linear", function(){
			var env = new Envelope(0.01, 0.01, 0.5, 0.3);
			env.decayCurve = "exponential";
			expect(env.decayCurve).to.equal("exponential");
			env.triggerAttack();
			env.dispose();
			//and can be linear
			var env2 = new Envelope(0.01, 0.01, 0.5, 0.3);
			env2.decayCurve = "linear";
			expect(env2.decayCurve).to.equal("linear");
			env2.triggerAttack();
			//and test a non-curve
			expect(function(){
				env2.decayCurve = "other";
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

		it("correctly schedules an exponential attack", function(){
			var e = {
				attack : 0.01,
				decay : 0.4,
				sustain : 0.5,
				release : 0.1
			};
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.attackCurve = "exponential";
				env.toMaster();
				env.triggerAttack(0);
			}, 0.7).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.within(0, 1);
				}, 0, e.attack);
				buffer.forEach(function(sample){
					expect(sample).to.be.within(e.sustain - 0.001, 1);
				}, e.attack, e.attack + e.decay);
				buffer.forEach(function(sample){
					expect(sample).to.be.closeTo(e.sustain, 0.01);
				}, e.attack + e.decay);
			});
		});

		it("correctly schedules a linear release", function(){
			var e = {
				attack : 0.01,
				decay : 0.4,
				sustain : 0.5,
				release : 0.1
			};
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.attackCurve = "exponential";
				env.toMaster();
				env.triggerAttack(0);
			}, 0.7).then(function(buffer){
				buffer.forEach(function(sample, time){
					var target = 1 - (time - 0.2) * 10;
					expect(sample).to.be.closeTo(target, 0.01);
				}, 0.2, 0.2);
			});
		});

		it("correctly schedules a linear decay", function(){
			var e = {
				attack : 0.1,
				decay : 0.5,
				sustain : 0,
				release : 0.1,
			};
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.decayCurve = "linear";
				env.toMaster();
				env.triggerAttack(0);
			}, 0.7).then(function(buffer){
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(0.5, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0.8, 0.01);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0.6, 0.01);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(0.4, 0.01);
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0.2, 0.01);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(0, 0.01);
			});
		});

		it("correctly schedules an exponential decay", function(){
			var e = {
				attack : 0.1,
				decay : 0.5,
				sustain : 0,
				release : 0.1,
			};
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.decayCurve = "exponential";
				env.toMaster();
				env.triggerAttack(0);
			}, 0.7).then(function(buffer){
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0.27, 0.01);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0.07, 0.01);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(0.02, 0.01);
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0.005, 0.01);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(0, 0.01);
			});
		});

		it("can schedule a very short attack", function(){
			var e = {
				attack : 0.001,
				decay : 0.01,
				sustain : 0.0,
				release : 0.1
			};
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.attackCurve = "exponential";
				env.toMaster();
				env.triggerAttack(0);
			}, 0.2).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.within(0, 1);
				}, 0, e.attack);
				buffer.forEach(function(sample){
					expect(sample).to.be.within(e.sustain - 0.001, 1);
				}, e.attack, e.attack + e.decay);
				buffer.forEach(function(sample){
					expect(sample).to.be.closeTo(e.sustain, 0.01);
				}, e.attack + e.decay);
			});
		});

		it("can schedule an attack of time 0", function(){
			return Offline(function(){
				var env = new Envelope(0, 0.1);
				env.toMaster();
				env.triggerAttack(0.1);
			}, 0.2).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.001);
				expect(buffer.getValueAtTime(0.0999)).to.be.closeTo(0, 0.001);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.001);
			});
		});

		it("correctly schedule a release", function(){
			var e = {
				attack : 0.001,
				decay : 0.01,
				sustain : 0.5,
				release : 0.3
			};
			var releaseTime = 0.2;
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.attackCurve = "exponential";
				env.toMaster();
				env.triggerAttackRelease(releaseTime);
			}, 0.6).then(function(buffer){
				var sustainStart = e.attack + e.decay;
				var sustainEnd = sustainStart + releaseTime;
				buffer.forEach(function(sample){
					expect(sample).to.be.below(e.sustain + 0.01);
				}, sustainStart, sustainEnd);
				buffer.forEach(function(sample){
					expect(sample).to.be.closeTo(0, 0.01);
				}, releaseTime + e.release);
			});
		});

		it("can retrigger a short attack at the same time as previous release", function(){
			return Offline(function(){
				var env = new Envelope(0.001, 0.1, 0.5);
				env.attackCurve = 'linear'
				env.toMaster();
				env.triggerAttack(0)
				env.triggerRelease(0.4)
				env.triggerAttack(0.4)
			}, 0.6).then(function(buffer){
				expect(buffer.getValueAtTime(0.4)).be.closeTo(0.5, 0.01)
				expect(buffer.getValueAtTime(0.40025)).be.closeTo(0.75, 0.01)
				expect(buffer.getValueAtTime(0.4005)).be.closeTo(1, 0.01)
			});
		});

		it("is silent before and after triggering", function(){
			var e = {
				attack : 0.001,
				decay : 0.01,
				sustain : 0.5,
				release : 0.3
			};
			var releaseTime = 0.2;
			var attackTime = 0.1;
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.attackCurve = "exponential";
				env.toMaster();
				env.triggerAttack(attackTime);
				env.triggerRelease(releaseTime);
			}, 0.6).then(function(buffer){
				expect(buffer.getValueAtTime(attackTime - 0.001)).to.equal(0);
				expect(buffer.getValueAtTime(e.attack + e.decay + releaseTime + e.release)).to.be.below(0.01);
			});
		});

		it("is silent after decay if sustain is 0", function(){
			var e = {
				attack : 0.01,
				decay : 0.04,
				sustain : 0,
			};
			var attackTime = 0.1;
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain);
				env.toMaster();
				env.triggerAttack(attackTime);
			}, 0.4).then(function(buffer){
				buffer.forEach(function(sample, time){
					expect(buffer.getValueAtTime(attackTime - 0.001)).to.equal(0);
					expect(buffer.getValueAtTime(attackTime + e.attack + e.decay)).to.be.below(0.01);
				});
			});
		});

		it("correctly schedule an attack release envelope", function(){
			var e = {
				attack : 0.08,
				decay : 0.2,
				sustain : 0.1,
				release : 0.2
			};
			var releaseTime = 0.4;
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.toMaster();
				env.triggerAttack(0);
				env.triggerRelease(releaseTime);
			}).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < e.attack){
						expect(sample).to.be.within(0, 1);
					} else if (time < e.attack + e.decay){
						expect(sample).to.be.within(e.sustain, 1);
					} else if (time < releaseTime){
						expect(sample).to.be.closeTo(e.sustain, 0.1);
					} else if (time < releaseTime + e.release){
						expect(sample).to.be.within(0, e.sustain + 0.01);
					} else {
						expect(sample).to.be.below(0.0001);
					}
				});
			});
		});

		it("can schedule a combined AttackRelease", function(){
			var e = {
				attack : 0.1,
				decay : 0.2,
				sustain : 0.35,
				release : 0.1
			};
			var releaseTime = 0.4;
			var duration = 0.4;
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.toMaster();
				env.triggerAttack(0);
				env.triggerRelease(releaseTime);
			}, 0.7).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < e.attack){
						expect(sample).to.be.within(0, 1);
					} else if (time < e.attack + e.decay){
						expect(sample).to.be.within(e.sustain - 0.001, 1);
					} else if (time < duration){
						expect(sample).to.be.closeTo(e.sustain, 0.1);
					} else if (time < duration + e.release){
						expect(sample).to.be.within(0, e.sustain + 0.01);
					} else {
						expect(sample).to.be.below(0.0015);
					}
				});
			});
		});

		it("can schedule a combined AttackRelease with velocity", function(){
			var e = {
				attack : 0.1,
				decay : 0.2,
				sustain : 0.35,
				release : 0.1
			};
			var releaseTime = 0.4;
			var duration = 0.4;
			var velocity = 0.4;
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.toMaster();
				env.triggerAttack(0, velocity);
				env.triggerRelease(releaseTime);
			}, 0.7).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < e.attack){
						expect(sample).to.be.within(0, velocity + 0.01);
					} else if (time < e.attack + e.decay){
						expect(sample).to.be.within(e.sustain * velocity - 0.01, velocity + 0.01);
					} else if (time < duration){
						expect(sample).to.be.closeTo(e.sustain * velocity, 0.1);
					} else if (time < duration + e.release){
						expect(sample).to.be.within(0, e.sustain * velocity + 0.01);
					} else {
						expect(sample).to.be.below(0.01);
					}
				});
			});
		});

		it("can schedule multiple envelopes", function(){
			var e = {
				attack : 0.1,
				decay : 0.2,
				sustain : 0.0,
				release : 0.1
			};
			return Offline(function(){
				var env = new Envelope(e.attack, e.decay, e.sustain, e.release);
				env.toMaster();
				env.triggerAttack(0);
				env.triggerAttack(0.5);
			}, 0.85).then(function(buffer){
				//first trigger
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.01);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0, 0.01);
				//second trigger
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(1, 0.01);
				expect(buffer.getValueAtTime(0.8)).to.be.closeTo(0, 0.01);
			});
		});

		it("can schedule multiple attack/releases with no discontinuities", function(){
			return Offline(function(){
				var env = new Envelope(0.1, 0.2, 0.2, 0.4).toMaster();
				env.triggerAttackRelease(0, 0.4);
				env.triggerAttackRelease(0.4, 0.11);
				env.triggerAttackRelease(0.45, 0.1);
				env.triggerAttackRelease(1.1, 0.09);
				env.triggerAttackRelease(1.5, 0.3);
				env.triggerAttackRelease(1.8, 0.29);
			}, 2).then(function(buffer){
				//test for discontinuities
				var lastSample = 0;
				buffer.forEach(function(sample, time){
					expect(sample).to.be.at.most(1);
					var diff = Math.abs(lastSample - sample);
					expect(diff).to.be.lessThan(0.001);
					lastSample = sample;
				});
			});
		});

		it("can schedule multiple 'linear' attack/releases with no discontinuities", function(){
			return Offline(function(){
				var env = new Envelope(0.1, 0.2, 0.2, 0.4).toMaster();
				env.attackCurve = "linear";
				env.releaseCurve = "linear";
				env.triggerAttackRelease(0, 0.4);
				env.triggerAttackRelease(0.4, 0.11);
				env.triggerAttackRelease(0.45, 0.1);
				env.triggerAttackRelease(1.1, 0.09);
				env.triggerAttackRelease(1.5, 0.3);
				env.triggerAttackRelease(1.8, 0.29);
			}, 2).then(function(buffer){
				//test for discontinuities
				var lastSample = 0;
				buffer.forEach(function(sample, time){
					expect(sample).to.be.at.most(1);
					var diff = Math.abs(lastSample - sample);
					expect(diff).to.be.lessThan(0.001);
					lastSample = sample;
				});
			});
		});

		it("can schedule multiple 'exponential' attack/releases with no discontinuities", function(){
			return Offline(function(){
				var env = new Envelope(0.1, 0.2, 0.2, 0.4).toMaster();
				env.attackCurve = "exponential";
				env.releaseCurve = "exponential";
				env.triggerAttackRelease(0, 0.4);
				env.triggerAttackRelease(0.4, 0.11);
				env.triggerAttackRelease(0.45, 0.1);
				env.triggerAttackRelease(1.1, 0.09);
				env.triggerAttackRelease(1.5, 0.3);
				env.triggerAttackRelease(1.8, 0.29);
			}, 2).then(function(buffer){
				//test for discontinuities
				var lastSample = 0;
				buffer.forEach(function(sample, time){
					expect(sample).to.be.at.most(1);
					var diff = Math.abs(lastSample - sample);
					expect(diff).to.be.lessThan(0.0035);
					lastSample = sample;
				});
			});
		});

		it("can schedule multiple 'sine' attack/releases with no discontinuities", function(){
			return Offline(function(){
				var env = new Envelope(0.1, 0.2, 0.2, 0.4).toMaster();
				env.attackCurve = "sine";
				env.releaseCurve = "sine";
				env.triggerAttackRelease(0, 0.4);
				env.triggerAttackRelease(0.4, 0.11);
				env.triggerAttackRelease(0.45, 0.1);
				env.triggerAttackRelease(1.1, 0.09);
				env.triggerAttackRelease(1.5, 0.3);
				env.triggerAttackRelease(1.8, 0.29);
			}, 2).then(function(buffer){
				//test for discontinuities
				var lastSample = 0;
				buffer.forEach(function(sample, time){
					expect(sample).to.be.at.most(1);
					var diff = Math.abs(lastSample - sample);
					expect(diff).to.be.lessThan(0.0035);
					lastSample = sample;
				});
			});
		});

		it("can schedule multiple 'cosine' attack/releases with no discontinuities", function(){
			return Offline(function(){
				var env = new Envelope(0.1, 0.2, 0.2, 0.4).toMaster();
				env.attackCurve = "cosine";
				env.releaseCurve = "cosine";
				env.triggerAttackRelease(0, 0.4);
				env.triggerAttackRelease(0.4, 0.11);
				env.triggerAttackRelease(0.45, 0.1);
				env.triggerAttackRelease(1.1, 0.09);
				env.triggerAttackRelease(1.5, 0.3);
				env.triggerAttackRelease(1.8, 0.29);
			}, 2).then(function(buffer){
				//test for discontinuities
				var lastSample = 0;
				buffer.forEach(function(sample, time){
					expect(sample).to.be.at.most(1);
					var diff = Math.abs(lastSample - sample);
					expect(diff).to.be.lessThan(0.002);
					lastSample = sample;
				});
			});
		});

		it("reports its current envelope value (.value)", function(){
			return Offline(function(){
				var env = new Envelope(1, 0.2, 1).toMaster();
				expect(env.value).to.be.closeTo(0, 0.01);
				env.triggerAttack();
				return function(time){
					expect(env.value).to.be.closeTo(time, 0.01);
				};
			}, 0.5);
		});

		it("can cancel a schedule envelope", function(){
			return Offline(function(){
				var env = new Envelope(0.1, 0.2, 1).toMaster();
				env.triggerAttack(0.2);
				env.cancel(0.2);
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});
	});

	context("Attack/Release Curves", function(){

		it("can get set all of the types as the attackCurve", function(){

			var env = new Envelope();
			for (var type in Envelope.Type){
				env.attackCurve = type;
				expect(env.attackCurve).to.equal(type);
			}
			env.dispose();
		});

		it("can get set all of the types as the releaseCurve", function(){
			var env = new Envelope();
			for (var type in Envelope.Type){
				env.releaseCurve = type;
				expect(env.releaseCurve).to.equal(type);
			}
			env.dispose();
		});

		it("outputs a signal when the attack/release curves are set to 'bounce'", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : "bounce",
					releaseCurve : "bounce",
				}).toMaster();
				env.triggerAttackRelease(0.3, 0.1);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.above(0);
				}, 0.101, 0.7);
			});
		});

		it("outputs a signal when the attack/release curves are set to 'ripple'", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : "ripple",
					releaseCurve : "ripple",
				}).toMaster();
				env.triggerAttackRelease(0.3, 0.1);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.above(0);
				}, 0.101, 0.7);
			});
		});

		it("outputs a signal when the attack/release curves are set to 'sine'", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : "sine",
					releaseCurve : "sine",
				}).toMaster();
				env.triggerAttackRelease(0.3, 0.1);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.above(0);
				}, 0.101, 0.7);
			});
		});

		it("outputs a signal when the attack/release curves are set to 'cosine'", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : "cosine",
					releaseCurve : "cosine",
				}).toMaster();
				env.triggerAttackRelease(0.3, 0.1);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.above(0);
				}, 0.101, 0.7);
			});
		});

		it("outputs a signal when the attack/release curves are set to 'step'", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : "step",
					releaseCurve : "step",
				}).toMaster();
				env.triggerAttackRelease(0.3, 0.1);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time > 0.3 && time < 0.5){
						expect(sample).to.be.above(0);
					} else if (time < 0.1){
						expect(sample).to.equal(0);
					}
				});
			});
		});

		it("outputs a signal when the attack/release curves are set to an array", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : [0, 1, 0, 1],
					releaseCurve : [1, 0, 1, 0],
				}).toMaster();
				env.triggerAttackRelease(0.3, 0.1);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time > 0.4 && time < 0.5){
						expect(sample).to.be.above(0);
					} else if (time < 0.1){
						expect(sample).to.equal(0);
					}
				});
			});
		});

		it("can scale a velocity with a custom curve", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.3,
					sustain : 1,
					release : 0.3,
					decay : 0,
					attackCurve : [0, 1, 0, 1],
					releaseCurve : [1, 0, 1, 0],
				}).toMaster();
				env.triggerAttackRelease(0.4, 0.1, 0.5);
			}, 0.8).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.at.most(0.51);
				});
			});
		});

		it("can retrigger partial envelope with custom type", function(){
			return Offline(function(){
				var env = new Envelope({
					attack : 0.5,
					sustain : 1,
					release : 0.5,
					decay : 0,
					attackCurve : "cosine",
					releaseCurve : "sine",
				}).toMaster();
				env.triggerAttack(0);
				env.triggerRelease(0.2);
				env.triggerAttack(0.5);
			}, 1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.equal(0);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0.32, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0.6, 0.01);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0.53, 0.01);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(0.38, 0.01);
				expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0.2, 0.01);
				expect(buffer.getValueAtTime(0.6)).to.be.closeTo(0.52, 0.01);
				expect(buffer.getValueAtTime(0.7)).to.be.closeTo(0.78, 0.01);
				expect(buffer.getValueAtTime(0.8)).to.be.closeTo(0.95, 0.01);
				expect(buffer.getValueAtTime(0.9)).to.be.closeTo(1, 0.01);
			});
		});
	});
});

