import Test from "helper/Test";
import TimelineState from "Tone/core/TimelineState";

describe("TimelineState", function(){

	it("can be created and disposed", function(){
		var sched = new TimelineState();
		sched.dispose();
		Test.wasDisposed(sched);
	});

	it("can schedule a state at a given time", function(){
		var sched = new TimelineState();
		sched.setStateAtTime("A", 0);
		sched.setStateAtTime("B", 1);
		sched.setStateAtTime("C", 1);
		sched.dispose();
	});

	it("can get a state at a given time", function(){
		var sched = new TimelineState();
		sched.setStateAtTime("A", 0);
		sched.setStateAtTime("B", 1);
		sched.setStateAtTime("C", 2);
		expect(sched.getValueAtTime(1)).to.equal("B");
		expect(sched.getValueAtTime(0.999)).to.equal("A");
		sched.dispose();
	});

	it("returns undefined if it's before any scheduled states", function(){
		var sched = new TimelineState();
		sched.setStateAtTime("A", 0);
		sched.setStateAtTime("B", 1);
		sched.setStateAtTime("C", 2);
		expect(sched.getValueAtTime(-11)).is.undefined;
		sched.dispose();
	});

	it("returns initial state if defined and query time is before any scheduled states", function(){
		var sched = new TimelineState("initial");
		sched.setStateAtTime("A", 20);
		sched.setStateAtTime("B", 21);
		sched.setStateAtTime("C", 22);
		expect(sched.getValueAtTime(0)).is.equal("initial");
		sched.dispose();
	});

	it("gets the last occurance of the state at or before the given time", function(){
		var sched = new TimelineState();
		sched.setStateAtTime("A", 0);
		sched.setStateAtTime("B", 1);
		sched.setStateAtTime("C", 2);
		sched.setStateAtTime("B", 3);
		expect(sched.getLastState("B", 1)).exists;
		expect(sched.getLastState("B", 1).state).is.equal("B");
		expect(sched.getLastState("B", 2)).exists;
		expect(sched.getLastState("B", 2).state).is.equal("B");
		expect(sched.getLastState("B", 2).time).is.equal(1);
		expect(sched.getLastState("B", 0.9)).not.exists;
		expect(sched.getLastState("B", 4).state).is.equal("B");
		expect(sched.getLastState("B", 4).time).is.equal(3);
		sched.dispose();
	});
	
	it("gets the next occurance of the state at or before the given time", function(){
		var sched = new TimelineState();
		sched.setStateAtTime("A", 0);
		sched.setStateAtTime("B", 1);
		sched.setStateAtTime("C", 2);
		sched.setStateAtTime("B", 3);
		expect(sched.getNextState("B", 1)).exists;
		expect(sched.getNextState("B", 1).state).is.equal("B");
		expect(sched.getNextState("B", 2)).exists;
		expect(sched.getNextState("B", 2).state).is.equal("B");
		expect(sched.getNextState("B", 2).time).is.equal(3);
		expect(sched.getNextState("B", 0.9)).exists;
		expect(sched.getNextState("B", 0.9).state).is.equal("B");
		expect(sched.getNextState("B", 0.9).time).is.equal(1);
		sched.dispose();
	});
});

