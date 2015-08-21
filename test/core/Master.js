define(["Test", "Tone/core/Master", "Tone/core/Tone", "helper/Offline", "helper/PassAudio"], 
	function (Test, Master, Tone, Offline, PassAudio) {

	describe("Master", function(){
		it ("exists", function(){
			expect(Tone.Master).to.exist;
		});

		it ("provides a toMaster method", function(){
			expect(Tone.prototype.toMaster).is.a("function");
			expect(AudioNode.prototype.toMaster).is.a("function");
		});

		it ("can be muted and unmuted", function(){
			Tone.Master.mute = false;
			expect(Tone.Master.mute).to.be.false;
			Tone.Master.mute = true;
			expect(Tone.Master.mute).to.be.true;
		});

		it ("passes audio through", function(done){
			PassAudio(function(input){
				input.toMaster();
			}, done);
		});

		it ("passes no audio when muted", function(done){
			var offline = new Offline();
			offline.before(function(){
				Tone.Master.mute = true;
			});
			offline.test(function(sample){
				expect(sample).to.equal(0);
			});
			offline.after(done);
			offline.run();
		});

		it ("has a master volume control", function(){
			Tone.Master.volume.value = -20;
			expect(Tone.Master.volume.value).to.be.closeTo(-20, 0.1);
		});

		it ("can pass audio through chained nodes", function(done){
			var gain;
			PassAudio(function(input){
				gain = Tone.context.createGain();
				input.connect(gain);
				Tone.Master.chain(gain);
			}, function(){
				gain.disconnect();
				done();
			});
		});
	});
});