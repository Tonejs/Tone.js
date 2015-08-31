define(["Test", "Tone/core/Tone", "Tone/core/Delay", "helper/PassAudio"], function (Test, Tone, Delay, PassAudio) {

	describe("Delay", function(){

		it("can be created and disposed", function(){
			var delay = new Delay();
			delay.dispose();
			Test.wasDisposed(delay);
		});

		it("handles input and output connections", function(){
			var delay = new Delay();
			delay.connect(Test);
			Test.connect(delay);
			Test.connect(delay.delayTime);
			delay.dispose();
		});

		it("can set delay time", function(){
			var delay = new Delay();
			delay.delayTime.value = 0.2;
			expect(delay.delayTime.value).to.be.closeTo(0.2, 0.001);
			delay.dispose();
		});

		it("can be constructed with an options object", function(){
			var delay = new Delay({
				"delayTime" : 0.3,
				"maxDelay" : 2
			});
			expect(delay.delayTime.value).to.be.closeTo(0.3, 0.001);
			delay.dispose();
		});

		it("can returns state from 'get' method", function(){
			var delay = new Delay({
				"delayTime" : 0.4,
				"maxDelay" : 2
			});
			var values = delay.get();
			expect(values.delayTime).to.be.closeTo(0.4, 0.001);
			delay.dispose();
		});

		it ("passes audio through", function(done){
			var delay;
			PassAudio(function(input, output){
				delay = new Delay();
				delay.delayTime.value = 0;
				input.chain(delay, output);
			}, function(){
				delay.dispose();
				done();
			});
		});		

	});
});