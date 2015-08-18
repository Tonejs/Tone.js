define(["Test", "Tone/core/TimelineState"], function (Test, TimelineState) {

	describe("TimelineState", function(){

		it ("can be created and disposed", function(){
			var sched = new TimelineState();
			sched.dispose();
			Test.wasDisposed(sched);
		});

		it ("can schedule a state at a given time", function(){
			var sched = new TimelineState();
			sched.setStateAtTime("A", 0);
			sched.setStateAtTime("B", 1);
			sched.setStateAtTime("C", 1);
			sched.dispose();
		});

		it ("can get a state at a given time", function(){
			var sched = new TimelineState();
			sched.setStateAtTime("A", 0);
			sched.setStateAtTime("B", 1);
			sched.setStateAtTime("C", 2);
			expect(sched.getStateAtTime(1)).to.equal("B");
			expect(sched.getStateAtTime(0.999)).to.equal("A");
			sched.dispose();
		});

		it ("returns undefined if it's before any scheduled states", function(){
			var sched = new TimelineState();
			sched.setStateAtTime("A", 0);
			sched.setStateAtTime("B", 1);
			sched.setStateAtTime("C", 2);
			expect(sched.getStateAtTime(-11)).is.undefined;
			sched.dispose();
		});

		it ("returns initial state if defined and query time is before any scheduled states", function(){
			var sched = new TimelineState("initial");
			sched.setStateAtTime("A", 20);
			sched.setStateAtTime("B", 21);
			sched.setStateAtTime("C", 22);
			expect(sched.getStateAtTime(0)).is.equal("initial");
			sched.dispose();
		});
		
	});
});