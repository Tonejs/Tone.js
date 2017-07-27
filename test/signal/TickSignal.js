define(["Test", "Tone/signal/TickSignal", "helper/Offline"], 
	function (Test, TickSignal, Offline) {

	describe("TickSignal", function(){

		it("can be created and disposed", function(){
			var tickSignal = new TickSignal();
			tickSignal.dispose();
			Test.wasDisposed(tickSignal);
		});

		it("can schedule a change in the future", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(2, 0.2);
			tickSignal.dispose();
		});

		it("can schedule a ramp in the future", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(2, 0);
			tickSignal.linearRampToValueAtTime(0.1, 0.2);
			tickSignal.exponentialRampToValueAtTime(1, 0.4);
			tickSignal.dispose();
		});

		it("calculates the ticks when no changes are scheduled", function(){
			var tickSignal0 = new TickSignal(2);
			expect(tickSignal0.getTickAtTime(1)).to.be.closeTo(2, 0.01);
			expect(tickSignal0.getTickAtTime(2)).to.be.closeTo(4, 0.01);
			tickSignal0.dispose();

			var tickSignal1 = new TickSignal(1);
			expect(tickSignal1.getTickAtTime(1)).to.be.closeTo(1, 0.01);
			expect(tickSignal1.getTickAtTime(2)).to.be.closeTo(2, 0.01);
			tickSignal1.dispose();
		});

		it("calculates the ticks in the future when a setValueAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(2, 0.5);
			expect(tickSignal.getTickAtTime(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTickAtTime(0.5)).to.be.closeTo(0.5, 0.01);
			expect(tickSignal.getTickAtTime(0.75)).to.be.closeTo(1, 0.01);
			expect(tickSignal.getTickAtTime(1)).to.be.closeTo(1.5, 0.01);
			tickSignal.dispose();
		});

		it("calculates the ticks in the future when multiple setValueAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(2, 1);
			tickSignal.setValueAtTime(4, 2);
			expect(tickSignal.getTickAtTime(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTickAtTime(0.5)).to.be.closeTo(0.5, 0.01);
			expect(tickSignal.getTickAtTime(1)).to.be.closeTo(1, 0.01);
			expect(tickSignal.getTickAtTime(1.5)).to.be.closeTo(2, 0.01);
			expect(tickSignal.getTickAtTime(2)).to.be.closeTo(3, 0.01);
			expect(tickSignal.getTickAtTime(2.5)).to.be.closeTo(5, 0.01);
			expect(tickSignal.getTickAtTime(3)).to.be.closeTo(7, 0.01);
			tickSignal.dispose();
		});

		it("if ticks are 0, getTickAtTime will return 0", function(){
			var tickSignal = new TickSignal(0);
			tickSignal.setValueAtTime(0, 1);
			tickSignal.linearRampToValueAtTime(0, 2);
			expect(tickSignal.getTickAtTime(0)).to.equal(0);
			expect(tickSignal.getTickAtTime(1)).to.equal(0);
			expect(tickSignal.getTickAtTime(2)).to.equal(0);
			expect(tickSignal.getTickAtTime(3)).to.equal(0);
			tickSignal.dispose();
		});

		it("calculates the ticks in the future when a linearRampToValueAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.linearRampToValueAtTime(2, 1);
			expect(tickSignal.getTickAtTime(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTickAtTime(0.5)).to.be.closeTo(0.62, 0.01);
			expect(tickSignal.getTickAtTime(1)).to.be.closeTo(1.5, 0.01);
			expect(tickSignal.getTickAtTime(2)).to.be.closeTo(3.5, 0.01);
			tickSignal.dispose();
		});

		it("calculates the ticks in the future when multiple linearRampToValueAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.linearRampToValueAtTime(2, 1);
			tickSignal.linearRampToValueAtTime(0, 2);
			expect(tickSignal.getTickAtTime(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTickAtTime(0.5)).to.be.closeTo(0.62, 0.01);
			expect(tickSignal.getTickAtTime(1)).to.be.closeTo(1.5, 0.01);
			expect(tickSignal.getTickAtTime(2)).to.be.closeTo(2.5, 0.01);
			expect(tickSignal.getTickAtTime(3)).to.be.closeTo(2.5, 0.01);
			tickSignal.dispose();
		});

		it("calculates the ticks in the future when a exponentialRampToValueAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.exponentialRampToValueAtTime(2, 1);
			expect(tickSignal.getTickAtTime(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTickAtTime(0.5)).to.be.closeTo(0.6, 0.01);
			expect(tickSignal.getTickAtTime(1)).to.be.closeTo(1.5, 0.1);
			expect(tickSignal.getTickAtTime(2)).to.be.closeTo(3.5, 0.1);
			expect(tickSignal.getTickAtTime(3)).to.be.closeTo(5.5, 0.1);
			tickSignal.dispose();
		});

		it("calculates the ticks in the future when multiple exponentialRampToValueAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.exponentialRampToValueAtTime(2, 1);
			tickSignal.exponentialRampToValueAtTime(0, 2);
			expect(tickSignal.getTickAtTime(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTickAtTime(0.5)).to.be.closeTo(0.6, 0.01);
			expect(tickSignal.getTickAtTime(1)).to.be.closeTo(1.5, 0.1);
			expect(tickSignal.getTickAtTime(2)).to.be.closeTo(1.66, 0.1);
			expect(tickSignal.getTickAtTime(3)).to.be.closeTo(1.66, 0.1);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when setTargetAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setTargetAtTime(0.5, 0, 0.1);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(1.88, 0.01);
			expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(3.86, 0.01);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when multiple setTargetAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setTargetAtTime(0.5, 0, 0.1);
			tickSignal.setTargetAtTime(2, 1, 1);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(1.5, 0.1);
			expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(2.28, 0.1);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when nothing is scheduled", function(){
			var tickSignal0 = new TickSignal(1);
			expect(tickSignal0.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal0.getTimeOfTick(1)).to.be.closeTo(1, 0.01);
			expect(tickSignal0.getTimeOfTick(2)).to.be.closeTo(2, 0.01);
			expect(tickSignal0.getTimeOfTick(3)).to.be.closeTo(3, 0.01);
			tickSignal0.dispose();

			var tickSigna1 = new TickSignal(2);
			expect(tickSigna1.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSigna1.getTimeOfTick(1)).to.be.closeTo(0.5, 0.01);
			expect(tickSigna1.getTimeOfTick(2)).to.be.closeTo(1, 0.01);
			expect(tickSigna1.getTimeOfTick(3)).to.be.closeTo(1.5, 0.01);
			tickSigna1.dispose();
		});

		it("computes the time of a given tick when setValueAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(0.5, 1);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(1, 0.01);
			expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(3, 0.01);
			expect(tickSignal.getTimeOfTick(3)).to.be.closeTo(5, 0.01);
			tickSignal.dispose();
		});

		it("returns Infinity if the tick interval is 0", function(){
			var tickSignal = new TickSignal(0);
			expect(tickSignal.getTimeOfTick(1)).to.equal(Infinity);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when multiple setValueAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(0.5, 1);
			tickSignal.setValueAtTime(0, 2);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(1, 0.01);
			expect(tickSignal.getTimeOfTick(1.499)).to.be.closeTo(2, 0.01);
			expect(tickSignal.getTimeOfTick(2)).to.equal(Infinity);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when a linearRampToValueAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.linearRampToValueAtTime(2, 1);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(0.75, 0.1);
			expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(1.25, 0.1);
			expect(tickSignal.getTimeOfTick(3)).to.be.closeTo(1.75, 0.1);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when multiple linearRampToValueAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.linearRampToValueAtTime(2, 1);
			tickSignal.linearRampToValueAtTime(0, 2);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.1);
			expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(0.75, 0.1);
			expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(1.25, 0.1);
			expect(tickSignal.getTimeOfTick(3)).to.equal(Infinity);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when a exponentialRampToValueAtTime is scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.exponentialRampToValueAtTime(2, 1);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(1.25, 0.1);
			expect(tickSignal.getTimeOfTick(3)).to.be.closeTo(1.75, 0.1);
			tickSignal.dispose();
		});

		it("computes the time of a given tick when multiple exponentialRampToValueAtTime are scheduled", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.exponentialRampToValueAtTime(2, 1);
			tickSignal.exponentialRampToValueAtTime(0, 2);
			expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
			expect(tickSignal.getTimeOfTick(0.5)).to.be.closeTo(0.5, 0.1);
			expect(tickSignal.getTimeOfTick(1.5)).to.be.closeTo(1, 0.1);
			expect(tickSignal.getTimeOfTick(3)).to.equal(Infinity);
			tickSignal.dispose();
		});

		it("can schedule multiple types of curves", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(1, 0);
			tickSignal.exponentialRampToValueAtTime(4, 1);
			tickSignal.linearRampToValueAtTime(0.2, 2);
			tickSignal.setValueAtTime(2, 3);
			tickSignal.linearRampToValueAtTime(2, 4);
			tickSignal.setTargetAtTime(8, 5, 0.2);

			for (var time = 0; time < 5; time+=0.2){
				var tick = tickSignal.getTickAtTime(time);
				expect(tickSignal.getTimeOfTick(tick)).to.be.closeTo(time, 0.1);
			}

			tickSignal.dispose();
		});

		it ("can get the duration of a tick at any point in time", function(){
			var tickSignal = new TickSignal(1);
			tickSignal.setValueAtTime(2, 1);
			tickSignal.setValueAtTime(10, 2);
			expect(tickSignal.getDurationOfTicks(1, 0)).to.be.closeTo(1, 0.01);
			expect(tickSignal.getDurationOfTicks(1, 1)).to.be.closeTo(0.5, 0.01);
			expect(tickSignal.getDurationOfTicks(1, 2)).to.be.closeTo(0.1, 0.01);
			expect(tickSignal.getDurationOfTicks(2, 1.5)).to.be.closeTo(0.6, 0.01);
		});

		it("outputs a signal", function(){
			var sched;
				return Offline(function(){
				sched = new TickSignal(1).toMaster();
				sched.linearRampToValueBetween(3, 1, 2);
			}, 3).then(function(buffer){
				buffer.forEach(function(sample, time){
					expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.01);
				});
			});
		});

	});
});