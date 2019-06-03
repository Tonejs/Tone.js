import Test from "helper/Test";
import TransportTimelineSignal from "Tone/signal/TransportTimelineSignal";
import Offline from "helper/Offline";
import Tone from "Tone/type/Type";

describe("TransportTimelineSignal", function(){

	it("can be created and disposed", function(){
		var sched = new TransportTimelineSignal();
		sched.dispose();
		Test.wasDisposed(sched);
	});

	it("can schedule a change in the future", function(){
		var sched = new TransportTimelineSignal(1);
		sched.setValueAtTime(2, 0.2);
		sched.dispose();
	});

	it("can schedule setValueAtTime relative to the Transport", function(){
		return Offline(function(Transport){
			var sched = new TransportTimelineSignal(1).toMaster();
			sched.setValueAtTime(2, 0.1);
			sched.setValueAtTime(3, 0.2);
			Transport.start(0.1);
		}, 0.4, 1).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.201)).to.be.closeTo(2, 0.07);
			expect(buffer.getValueAtTime(0.301)).to.be.closeTo(3, 0.07);
		});
	});

	it("can schedule linearRampToValueAtTime relative to the Transport", function(){
		return Offline(function(Transport){
			var sched = new TransportTimelineSignal(1).toMaster();
			sched.setValueAtTime(1, 0.1);
			sched.linearRampToValueAtTime(2, 0.2);
			Transport.start(0.1);
		}, 0.4, 1).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.2)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.25)).to.be.closeTo(1.5, 0.07);
			expect(buffer.getValueAtTime(0.301)).to.be.closeTo(2, 0.07);
		});
	});

	it("can schedule exponentialRampToValueAtTime relative to the Transport", function(){
		return Offline(function(Transport){
			var sched = new TransportTimelineSignal(1).toMaster();
			sched.setValueAtTime(1, 0.1);
			sched.exponentialRampToValueAtTime(2, 0.2);
			Transport.start(0.1);
		}, 0.4, 1).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.2)).to.be.closeTo(1, 0.07);
			expect(buffer.getValueAtTime(0.25)).to.be.closeTo(1.4, 0.07);
			expect(buffer.getValueAtTime(0.301)).to.be.closeTo(2, 0.07);
		});
	});

	it("can get exponential ramp value in the future", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(0.5).toMaster();
			sched.setValueAtTime(0.5, 0);
			sched.exponentialRampToValueAtTime(1, 0.2);
			sched.exponentialRampToValueAtTime(0.5, 0.4);
			Transport.start(0.1);
		}, 0.6).then(function(buffer){
			buffer.forEach(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time - 0.1), 0.07);
			});
		});
	});

	it("can get exponential approach in the future", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(0.5).toMaster();
			sched.setValueAtTime(0.5, 0);
			sched.setTargetAtTime(1, 0.2, 0.2);
			Transport.start(0.1);
		}, 0.6).then(function(buffer){
			buffer.forEach(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time - 0.1), 0.07);
			});
		});
	});

	it("can loop the signal when the Transport loops", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(1).toMaster();
			Transport.setLoopPoints(0, 1);
			Transport.loop = true;
			sched.setValueAtTime(1, 0);
			sched.setValueAtTime(2, 0.5);
			Transport.start(0);
		}, 2).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.01);
			expect(buffer.getValueAtTime(0.5)).to.be.closeTo(2, 0.01);
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.01);
			expect(buffer.getValueAtTime(1.5)).to.be.closeTo(2, 0.01);
		});
	});

	it("can get set a curve in the future", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(0).toMaster();
			sched.setValueCurveAtTime([0, 1, 0.2, 0.8, 0], 0, 1);
			Transport.start(0.2);
		}, 1).then(function(buffer){
			buffer.forEach(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time - 0.2), 0.07);
			});
		});
	});

	it("can scale a curve value", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(1).toMaster();
			sched.setValueCurveAtTime([0, 1, 0], 0, 1, 0.5);
			Transport.start(0);
		}, 1).then(function(buffer){
			buffer.forEach(function(sample){
				expect(sample).to.be.at.most(0.51);
			});
		});
	});

	it("can schedule a linear ramp between two times", function(){
		var sched;
		return Offline(function(Transport){
			var sched = new TransportTimelineSignal(0).toMaster();
			sched.linearRampTo(1, 1, 1);
			Transport.start(0);
		}, 3).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.closeTo(0, 0.1);
			expect(buffer.getValueAtTime(0.5)).to.closeTo(0, 0.1);
			expect(buffer.getValueAtTime(1)).to.closeTo(0, 0.1);
			expect(buffer.getValueAtTime(1.5)).to.closeTo(0.5, 0.1);
			expect(buffer.getValueAtTime(2)).to.closeTo(1, 0.1);
		});
	});

	it("can get exponential ramp value between two times", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(1).toMaster();
			sched.exponentialRampTo(3, 1, 1);
			Transport.start(0);
		}, 3).then(function(buffer){
			buffer.forEach(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.02);
			});
		});
	});

	it("can cancel and hold a scheduled value", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(0).toMaster();
			sched.setValueAtTime(0, 0);
			sched.linearRampToValueAtTime(1, 1);
			sched.cancelAndHoldAtTime(0.5);
			Transport.start(0);
		}, 1).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.1);
			expect(buffer.getValueAtTime(0.25)).to.be.closeTo(0.25, 0.1);
			expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0.5, 0.1);
			expect(buffer.getValueAtTime(0.75)).to.be.closeTo(0.5, 0.1);
		});
	});

	it("can cancel a scheduled value", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(0).toMaster();
			sched.setValueAtTime(0, 0);
			sched.linearRampToValueAtTime(1, 0.5);
			sched.linearRampToValueAtTime(0, 1);
			sched.cancelScheduledValues(0.6);
			Transport.start(0);
		}, 1).then(function(buffer){
			expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.1);
			expect(buffer.getValueAtTime(0.25)).to.be.closeTo(0.5, 0.1);
			expect(buffer.getValueAtTime(0.5)).to.be.closeTo(1, 0.1);
			expect(buffer.getValueAtTime(0.75)).to.be.closeTo(1, 0.1);
		});
	});

	it("can automate values with different units", function(){
		var sched;
		return Offline(function(Transport){
			sched = new TransportTimelineSignal(-10, Tone.Type.Decibels).toMaster();
			sched.setValueAtTime(-5, 0);
			sched.linearRampToValueAtTime(-12, 0.5);
			sched.exponentialRampTo(-6, 0.1, 1);
			Transport.start(0);
		}, 1.2).then(function(buffer){
			buffer.forEach(function(sample, time){
				if (time < 0.5){
					expect(sample).to.be.within(Tone.dbToGain(-12.01), Tone.dbToGain(-4.99));
				} else if (time < 1){
					expect(sample).to.be.a.percentageFrom(Tone.dbToGain(-12), 0.02);
				} else if (time > 1.1){
					expect(sample).to.be.a.percentageFrom(Tone.dbToGain(-6), 0.02);
				}
			});
		});
	});
});

