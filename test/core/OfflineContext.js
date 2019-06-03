import Test from "helper/Test";
import OfflineContext from "Tone/core/OfflineContext";

context("OfflineContext", function(){

	it("can be created an disposed", function(){
		var ctx = new OfflineContext(1, 0.1, 44100);
		return ctx.dispose().then(function(){
			Test.wasDisposed(ctx);
		});
	});

	it("is setup with 0 lookAhead and offline clockSource", function(){
		var ctx = new OfflineContext(1, 0.1, 44100);
		expect(ctx.lookAhead).to.equal(0);
		expect(ctx.clockSource).to.equal("offline");
		return ctx.dispose();
	});

	it("can render audio", function(){
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

