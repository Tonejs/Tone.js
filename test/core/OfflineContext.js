define(["Test", "Tone/core/OfflineContext"], 
	function (Test, OfflineContext) {

	context("OfflineContext", function(){

		it ("can be created an disposed", function(){
			var ctx = new OfflineContext(1, 0.1, 44100);
			ctx.dispose();
			Test.wasDisposed(ctx);
		});

		it("is setup with 0 lookAhead and offline clockSource", function(){
			var ctx = new OfflineContext(1, 0.1, 44100);
			expect(ctx.lookAhead).to.equal(0);
			expect(ctx.clockSource).to.equal("offline");
			// ctx.dispose();
		});

		it ("render returns a promise", function(){
			var ctx = new OfflineContext(1, 0.1, 44100);
			var render = ctx.render();
			expect(render).to.be.instanceOf(Promise);
			return render;
		});

		it ("can render audio", function(){
			var ctx = new OfflineContext(1, 0.2, 44100);
			var osc = ctx.createOscillator();
			osc.connect(ctx.destination);
			osc.start(0.1);
			return ctx.render().then(function(buffer){
				expect(buffer).to.be.instanceOf(AudioBuffer);
				var array = buffer.getChannelData(0);
				for (var i = 0; i < array.length; i++){
					if (array[i] !== 0){
						expect(i/array.length).to.be.closeTo(0.5, 0.01);
						break;
					}
				}
			});
		});
	});
});