import Draw from "Tone/core/Draw";
import Tone from "Tone/core/Tone";
import Supports from "helper/Supports";

describe("Draw", function(){

	if (Supports.ONLINE_TESTING){
		
		it("can schedule a callback at a AudioContext time", function(done){
			var scheduledTime = Tone.now() + 0.2;
			Draw.schedule(function(){
				expect(Tone.context.currentTime).to.be.closeTo(scheduledTime, 0.05);
				done();
			}, scheduledTime);
		});

		it("can schedule multiple callbacks", function(done){
			var callbackCount = 0;
			var firstEvent = Tone.now() + 0.1;
			Draw.schedule(function(){
				callbackCount++;
				expect(Tone.context.currentTime).to.be.closeTo(firstEvent, 0.05);
			}, firstEvent);

			var thirdEvent = Tone.now() + 0.3;
			Draw.schedule(function(){
				callbackCount++;
				expect(Tone.context.currentTime).to.be.closeTo(thirdEvent, 0.05);
				expect(callbackCount).to.equal(3);
				done();
			}, thirdEvent);

			var secondEvent = Tone.now() + 0.2;
			Draw.schedule(function(){
				callbackCount++;
				expect(Tone.context.currentTime).to.be.closeTo(secondEvent, 0.05);
			}, secondEvent);
		});

		it("can cancel scheduled events", function(done){
			var callbackCount = 0;
			Draw.schedule(function(){
				callbackCount++;
			}, Tone.now() + 0.1);

			Draw.schedule(function(){
				throw new Error("should not call this method");
			}, Tone.now() + 0.2);

			Draw.schedule(function(){
				throw new Error("should not call this method");
			}, Tone.now() + 0.25);

			//cancel the second and third events
			Draw.cancel(Tone.now() + 0.15);

			//schedule another one after
			Draw.schedule(function(){
				callbackCount++;
				expect(callbackCount).to.equal(2);
				done();
			}, Tone.now() + 0.3);

		});
	}

});

