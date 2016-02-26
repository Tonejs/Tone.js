define(["Test", "Tone/core/Gain", "Tone/core/Tone", "helper/Offline", "helper/PassAudio"], 
	function (Test, Gain, Tone, Offline, PassAudio) {

	describe("Gain", function(){

		it ("can be created and disposed", function(){
			var gain = new Gain();
			gain.dispose();
			Test.wasDisposed(gain);
		});

		it("handles input and output connections", function(){
			var gain = new Gain();
			gain.connect(Test);
			Test.connect(gain);
			Test.connect(gain.gain);
			gain.dispose();
		});

		it("can set the gain value", function(){
			var gain = new Gain();
			gain.gain.value = 0.2;
			expect(gain.gain.value).to.be.closeTo(0.2, 0.001);
			gain.dispose();
		});

		it("can be constructed with options object", function(){

			var gain = new Gain({
				"gain" : 0.4
			});
			expect(gain.gain.value).to.be.closeTo(0.4, 0.001);
			gain.dispose();
		});

		it("can be constructed with an initial value", function(){
			var gain = new Gain(3);
			expect(gain.gain.value).to.be.closeTo(3, 0.001);
			gain.dispose();
		});

		it("can set the units", function(){
			var gain = new Gain(0, Tone.Type.Decibels);
			expect(gain.gain.value).to.be.closeTo(0, 0.001);
			expect(gain.gain.units).to.equal(Tone.Type.Decibels);
			gain.dispose();
		});

		it("can get the value using 'get'", function(){
			var gain = new Gain(5);
			var value = gain.get();
			expect(value.gain).to.be.closeTo(5, 0.001);
			gain.dispose();
		});

		it("can set the value using 'set'", function(){
			var gain = new Gain(5);
			gain.set("gain", 4);
			expect(gain.gain.value).to.be.closeTo(4, 0.001);
			gain.dispose();
		});

		it ("passes audio through", function(done){
			var gain;
			PassAudio(function(input, output){
				gain = new Gain();
				input.chain(gain, output);
			}, function(){
				gain.dispose();
				done();
			});
		});		
	});
});