define(["Tone/component/FrequencyEnvelope", "helper/Basic", "helper/Offline", "Test", "Tone/component/Envelope"], 
function (FrequencyEnvelope, Basic, Offline, Test, Envelope) {
	describe("FrequencyEnvelope", function(){

		Basic(FrequencyEnvelope);

		context("FrequencyEnvelope", function(){


			it("has an output connections", function(){
				var env = new FrequencyEnvelope();
				env.connect(Test);
				env.dispose();
			});

			it ("extends Envelope", function(){
				var env = new FrequencyEnvelope();
				expect(env).to.be.instanceOf(Envelope);
				env.dispose();
			});

			it ("can get and set values an Objects", function(){
				var env = new FrequencyEnvelope();
				var values = {
					"attack" : 0,
					"release" : "4n",
					"baseFrequency" : 20,
					"octaves" : 4
				};
				env.set(values);
				expect(env.get()).to.contain.keys(Object.keys(values));
				expect(env.baseFrequency).to.equal(20);
				expect(env.octaves).to.equal(4);
				env.dispose();
			});

			it ("can take parameters as both an object and as arguments", function(){
				var env0 = new FrequencyEnvelope({
					"attack" : 0,
					"decay" : 0.5,
					"sustain" : 1
				});
				expect(env0.attack).to.equal(0);
				expect(env0.decay).to.equal(0.5);
				expect(env0.sustain).to.equal(1);
				env0.dispose();
				var env1 = new FrequencyEnvelope(0.1, 0.2, 0.3);
				expect(env1.attack).to.equal(0.1);
				expect(env1.decay).to.equal(0.2);
				expect(env1.sustain).to.equal(0.3);
				env1.dispose();
			});


			it ("goes to the scaled range", function(done){
				var env;
				var offline = new Offline(0.3); 
				offline.before(function(dest){
					env = new FrequencyEnvelope(0.01, 0.4, 1);
					env.baseFrequency = 200;
					env.octaves = 3;
					env.attackCurve = "exponential";
					env.connect(dest);
					env.triggerAttack(0);
				});
				offline.test(function(sample, time){
					if (time < env.attack){
						expect(sample).to.be.within(200, 1600);
					} else if (time < env.attack + env.decay){
						expect(sample).to.be.closeTo(1600, 2);
					} 
				}); 
				offline.after(function(){
					env.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});