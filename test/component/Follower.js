define(["Tone/component/Follower", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo", "helper/Supports"], 
function (Follower, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo, Supports) {
	describe("Follower", function(){

		Basic(Follower);

		context("Envelope Following", function(){

			it("handles input and output connections", function(){
				var follower = new Follower();
				Test.connect(follower);
				follower.connect(Test);
				follower.dispose();
			});

			it("handles getter/setter as Object", function(){
				var foll = new Follower();
				var values = {
					"attack" : 0.2,
					"release" : 0.4
				};
				foll.set(values);
				expect(foll.get()).to.have.keys(["attack", "release"]);
				expect(foll.get().attack).to.be.closeTo(0.2, 0.001);
				expect(foll.get().release).to.be.closeTo(0.4, 0.001);
				foll.dispose();
			});

			it("can be constructed with an object", function(){
				var follower = new Follower({
					"attack" : 0.5,
					"release" : 0.3
				});
				expect(follower.attack).to.be.closeTo(0.5, 0.001);
				expect(follower.release).to.be.closeTo(0.3, 0.001);
				follower.dispose();
			});

			it("smoothes the incoming signal", function(done){
				var foll, sig;
				var offline = new Offline(0.1); 
				offline.before(function(dest){
					foll = new Follower(0.1, 0.5);
					sig = new Signal(0);
					sig.connect(foll);
					foll.connect(dest);
					sig.setValueAtTime(1, 0.1);
				}); 
				offline.test(function(sample){
					expect(sample).to.lessThan(1);
				}); 
				offline.after(function(){
					foll.dispose();
					sig.dispose();
					done();
				});
				offline.run();
			});

			/*it("smoothing follows attack and release", function(done){
				var foll, sig;
				var offline = new Offline(1); 
				offline.before(function(dest){
					foll = new Follower(0.1, 0.5);
					sig = new Signal(0);
					sig.connect(foll);
					foll.connect(dest);
					sig.setValueAtTime(1, 0);
					sig.setValueAtTime(0, 0.4);
				}); 
				var delta = 0.15;
				offline.test(function(sample, time){
					if (time < 0.1){
						expect(sample).to.be.within(0 - delta, 1 + delta);
					} else if (time < 0.4){
						expect(sample).to.be.closeTo(1, delta);
					} else if (time < 0.65){
						expect(sample).to.be.above(0);
					} else if (time < 0.9){
						expect(sample).to.be.within(0 - delta, 1 + delta);
					} else {
						expect(sample).to.be.closeTo(0, delta);
					}
				}); 
				offline.after(function(){
					foll.dispose();
					sig.dispose();
					done();
				});
				offline.run();
			});*/

			if (Supports.WAVESHAPER_0_POSITION){

				it("passes the incoming signal through", function(done){
					var follower;
					PassAudio(function(input, output){
						follower = new Follower();
						input.connect(follower);
						follower.connect(output);
					}, function(){
						follower.dispose();
						done();
					});
				});
			}

		});
	});
});