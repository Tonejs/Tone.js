import Test from "helper/Test";
import TickSignal from "Tone/signal/TickSignal";
import Offline from "helper/Offline";
import Signal from "Tone/signal/Signal";

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
		expect(tickSignal0.getTicksAtTime(1)).to.be.closeTo(2, 0.01);
		expect(tickSignal0.getTicksAtTime(2)).to.be.closeTo(4, 0.01);
		expect(tickSignal0.getTimeOfTick(4)).to.be.closeTo(2, 0.01);
		tickSignal0.dispose();

		var tickSignal1 = new TickSignal(1);
		expect(tickSignal1.getTicksAtTime(1)).to.be.closeTo(1, 0.01);
		expect(tickSignal1.getTicksAtTime(2)).to.be.closeTo(2, 0.01);
		expect(tickSignal1.getTimeOfTick(2)).to.be.closeTo(2, 0.01);
		tickSignal1.dispose();
	});

	it("calculates the ticks in the future when a setValueAtTime is scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(2, 0.5);
		expect(tickSignal.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTicksAtTime(0.5)).to.be.closeTo(0.5, 0.01);
		expect(tickSignal.getTicksAtTime(0.75)).to.be.closeTo(1, 0.01);
		expect(tickSignal.getTicksAtTime(1)).to.be.closeTo(1.5, 0.01);
		expect(tickSignal.getTimeOfTick(1.5)).to.be.closeTo(1, 0.01);
		tickSignal.dispose();
	});

	it("calculates the ticks in the future when multiple setValueAtTime are scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(2, 1);
		tickSignal.setValueAtTime(4, 2);
		expect(tickSignal.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTicksAtTime(0.5)).to.be.closeTo(0.5, 0.01);
		expect(tickSignal.getTicksAtTime(1)).to.be.closeTo(1, 0.01);
		expect(tickSignal.getTicksAtTime(1.5)).to.be.closeTo(2, 0.01);
		expect(tickSignal.getTicksAtTime(2)).to.be.closeTo(3, 0.01);
		expect(tickSignal.getTicksAtTime(2.5)).to.be.closeTo(5, 0.01);
		expect(tickSignal.getTicksAtTime(3)).to.be.closeTo(7, 0.01);
		expect(tickSignal.getTimeOfTick(7)).to.be.closeTo(3, 0.01);
		tickSignal.dispose();
	});

	it("if ticks are 0, getTicksAtTime will return 0", function(){
		var tickSignal = new TickSignal(0);
		tickSignal.setValueAtTime(0, 1);
		tickSignal.linearRampToValueAtTime(0, 2);
		expect(tickSignal.getTicksAtTime(0)).to.equal(0);
		expect(tickSignal.getTicksAtTime(1)).to.equal(0);
		expect(tickSignal.getTicksAtTime(2)).to.equal(0);
		expect(tickSignal.getTicksAtTime(3)).to.equal(0);
		tickSignal.dispose();
	});

	it("calculates the ticks in the future when a linearRampToValueAtTime is scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(1, 0);
		tickSignal.linearRampToValueAtTime(2, 1);
		expect(tickSignal.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTicksAtTime(0.5)).to.be.closeTo(0.62, 0.01);
		expect(tickSignal.getTicksAtTime(1)).to.be.closeTo(1.5, 0.01);
		expect(tickSignal.getTicksAtTime(2)).to.be.closeTo(3.5, 0.01);
		tickSignal.dispose();
	});

	it("calculates the ticks in the future when multiple linearRampToValueAtTime are scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(1, 0);
		tickSignal.linearRampToValueAtTime(2, 1);
		tickSignal.linearRampToValueAtTime(0, 2);
		expect(tickSignal.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTicksAtTime(0.5)).to.be.closeTo(0.62, 0.01);
		expect(tickSignal.getTicksAtTime(1)).to.be.closeTo(1.5, 0.01);
		expect(tickSignal.getTicksAtTime(2)).to.be.closeTo(2.5, 0.01);
		expect(tickSignal.getTicksAtTime(3)).to.be.closeTo(2.5, 0.01);
		tickSignal.dispose();
	});

	it("calculates the ticks in the future when a exponentialRampToValueAtTime is scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(1, 0);
		tickSignal.exponentialRampToValueAtTime(2, 1);
		expect(tickSignal.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTicksAtTime(0.5)).to.be.closeTo(0.6, 0.01);
		expect(tickSignal.getTicksAtTime(1)).to.be.closeTo(1.5, 0.1);
		expect(tickSignal.getTicksAtTime(2)).to.be.closeTo(3.5, 0.1);
		expect(tickSignal.getTicksAtTime(3)).to.be.closeTo(5.5, 0.1);
		tickSignal.dispose();
	});

	it("calculates the ticks in the future when multiple exponentialRampToValueAtTime are scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(1, 0);
		tickSignal.exponentialRampToValueAtTime(2, 1);
		tickSignal.exponentialRampToValueAtTime(0, 2);
		expect(tickSignal.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTicksAtTime(0.5)).to.be.closeTo(0.6, 0.01);
		expect(tickSignal.getTicksAtTime(1)).to.be.closeTo(1.5, 0.1);
		expect(tickSignal.getTicksAtTime(2)).to.be.closeTo(1.54, 0.1);
		expect(tickSignal.getTicksAtTime(3)).to.be.closeTo(1.54, 0.1);
		tickSignal.dispose();
	});

	it("computes the time of a given tick when setTargetAtTime is scheduled", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setTargetAtTime(0.5, 0, 0.1);
		expect(tickSignal.getTimeOfTick(0)).to.be.closeTo(0, 0.01);
		expect(tickSignal.getTimeOfTick(1)).to.be.closeTo(1.89, 0.01);
		expect(tickSignal.getTimeOfTick(2)).to.be.closeTo(3.89, 0.01);
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
			var tick = tickSignal.getTicksAtTime(time);
			expect(tickSignal.getTimeOfTick(tick)).to.be.closeTo(time, 0.1);
		}

		tickSignal.dispose();
	});

	it("can get the duration of a tick at any point in time", function(){
		var tickSignal = new TickSignal(1);
		tickSignal.setValueAtTime(2, 1);
		tickSignal.setValueAtTime(10, 2);
		expect(tickSignal.getDurationOfTicks(1, 0)).to.be.closeTo(1, 0.01);
		expect(tickSignal.getDurationOfTicks(1, 1)).to.be.closeTo(0.5, 0.01);
		expect(tickSignal.getDurationOfTicks(1, 2)).to.be.closeTo(0.1, 0.01);
		expect(tickSignal.getDurationOfTicks(2, 1.5)).to.be.closeTo(0.6, 0.01);
	});

	it("outputs a signal", function(){
		return Offline(function(){
			var sched = new TickSignal(1).toMaster();
			sched.linearRampTo(3, 1, 0);
		}, 1.01).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.01);
			expect(buffer.getValueAtTime(0.5)).to.be.closeTo(2, 0.01);
			expect(buffer.getValueAtTime(1)).to.be.closeTo(3, 0.01);
		});
	});

	context("Ticks <-> Time", function(){

		it("converts from time to ticks", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(20);
				expect(tickSignal.ticksToTime(20, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.ticksToTime(10, 0).valueOf()).to.be.closeTo(0.5, 0.01);
				expect(tickSignal.ticksToTime(10, 10).valueOf()).to.be.closeTo(0.5, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from time to ticks with a linear ramp on the tempo", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.linearRampTo(2, 2, 1);
				expect(tickSignal.ticksToTime(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.ticksToTime(1, 1).valueOf()).to.be.closeTo(0.82, 0.01);
				expect(tickSignal.ticksToTime(2, 0).valueOf()).to.be.closeTo(1.82, 0.01);
				expect(tickSignal.ticksToTime(1, 3).valueOf()).to.be.closeTo(0.5, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from time to ticks with a setValueAtTime", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.setValueAtTime(2, 1);
				expect(tickSignal.ticksToTime(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.ticksToTime(1, 1).valueOf()).to.be.closeTo(0.5, 0.01);
				expect(tickSignal.ticksToTime(2, 0).valueOf()).to.be.closeTo(1.5, 0.01);
				expect(tickSignal.ticksToTime(1, 3).valueOf()).to.be.closeTo(0.5, 0.01);
				expect(tickSignal.ticksToTime(1, 0.5).valueOf()).to.be.closeTo(0.75, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from time to ticks with an exponential ramp", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.exponentialRampTo(2, 1, 1);
				expect(tickSignal.ticksToTime(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.ticksToTime(1, 1).valueOf()).to.be.closeTo(0.75, 0.01);
				expect(tickSignal.ticksToTime(2, 0).valueOf()).to.be.closeTo(1.75, 0.01);
				expect(tickSignal.ticksToTime(1, 3).valueOf()).to.be.closeTo(0.5, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from time to ticks with a setTargetAtTime", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.setTargetAtTime(2, 1, 1);
				expect(tickSignal.ticksToTime(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.ticksToTime(1, 1).valueOf()).to.be.closeTo(0.79, 0.01);
				expect(tickSignal.ticksToTime(2, 0).valueOf()).to.be.closeTo(1.79, 0.01);
				expect(tickSignal.ticksToTime(1, 3).valueOf()).to.be.closeTo(0.61, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from ticks to time", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(20);
				expect(tickSignal.timeToTicks(1, 0).valueOf()).to.be.closeTo(20, 0.01);
				expect(tickSignal.timeToTicks(0.5, 0).valueOf()).to.be.closeTo(10, 0.01);
				expect(tickSignal.timeToTicks(0.5, 2).valueOf()).to.be.closeTo(10, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from ticks to time with a setValueAtTime", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.setValueAtTime(2, 1);
				expect(tickSignal.timeToTicks(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.timeToTicks(1, 1).valueOf()).to.be.closeTo(2, 0.01);
				expect(tickSignal.timeToTicks(1, 2).valueOf()).to.be.closeTo(2, 0.01);
				expect(tickSignal.timeToTicks(1, 0.5).valueOf()).to.be.closeTo(1.5, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from ticks to time with a linear ramp", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.linearRampTo(2, 1, 1);
				expect(tickSignal.timeToTicks(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.timeToTicks(1, 1).valueOf()).to.be.closeTo(1.5, 0.01);
				expect(tickSignal.timeToTicks(1, 2).valueOf()).to.be.closeTo(2, 0.01);
				expect(tickSignal.timeToTicks(1, 0.5).valueOf()).to.be.closeTo(1.12, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from ticks to time with an exponential ramp", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.exponentialRampTo(2, 1, 1);
				expect(tickSignal.timeToTicks(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.timeToTicks(1, 1).valueOf()).to.be.closeTo(1.44, 0.01);
				expect(tickSignal.timeToTicks(1, 2).valueOf()).to.be.closeTo(2, 0.01);
				expect(tickSignal.timeToTicks(1, 0.5).valueOf()).to.be.closeTo(1.09, 0.01);
				tickSignal.dispose();
			});
		});

		it("converts from ticks to time with a setTargetAtTime", function(){
			return Offline(function(){
				var tickSignal = new TickSignal(1);
				tickSignal.setTargetAtTime(2, 1, 1);
				expect(tickSignal.timeToTicks(1, 0).valueOf()).to.be.closeTo(1, 0.01);
				expect(tickSignal.timeToTicks(1, 1).valueOf()).to.be.closeTo(1.31, 0.01);
				expect(tickSignal.timeToTicks(1, 2).valueOf()).to.be.closeTo(1.63, 0.01);
				expect(tickSignal.timeToTicks(1, 0.5).valueOf()).to.be.closeTo(1.07, 0.01);
				tickSignal.dispose();
			});
		});
	});
});

