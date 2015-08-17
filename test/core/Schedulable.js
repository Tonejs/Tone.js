define(["Test", "Tone/core/Schedulable"], function (Test, Schedulable) {

	describe("Schedulable", function(){

		it ("can be created and disposed", function(){
			var sched = new Schedulable();
			sched.dispose();
			Test.wasDisposed(sched);
		});

		it ("has a private timeline array", function(){
			var sched = new Schedulable();
			expect(sched).has.property("_timeline").that.is.an("array")
		});

		it ("accepts events into the timeline", function(){
			var sched = new Schedulable();
			sched._insertEvent({
				"state" : "A",
				"time"  : 0
			});
			sched._insertEvent({
				"state" : "B",
				"time"  : 1
			});
			sched._insertEvent({
				"state" : "C",
				"time"  : 2
			});
			sched.dispose();
		});

		it ("can insert events in the timeline in the right order", function(){
			var sched = new Schedulable();
			sched._insertEvent({
				"time"  : 0
			});
			sched._insertEvent({
				"time"  : 2
			});
			sched._insertEvent({
				"time"  : 1
			});
			expect(sched._timeline[0].time).to.equal(0);
			expect(sched._timeline[1].time).to.equal(1);
			expect(sched._timeline[2].time).to.equal(2);
			sched.dispose();
		});

		it ("can search for events in the timeline by time", function(){
			var sched = new Schedulable();
			sched._insertEvent({
				"time"  : 0
			});
			sched._insertEvent({
				"time"  : 2
			});
			sched._insertEvent({
				"time"  : 1
			});
			expect(sched._search(0)).to.equal(0);
			expect(sched._search(0.01)).to.equal(0);
			expect(sched._search(1)).to.equal(1);
			expect(sched._search(1.01)).to.equal(1);
			expect(sched._search(20000)).to.equal(2);
			expect(sched._search(-1)).to.equal(-1);
			sched.dispose();
		});

		it ("can get the scheduled event at the given time", function(){
			var sched = new Schedulable();
			sched._insertEvent({
				"state" : "A",
				"time"  : 2
			});
			sched._insertEvent({
				"state" : "C",
				"time"  : 9.4
			});
			sched._insertEvent({
				"state" : "B",
				"time"  : 6
			});
			expect(sched._getEvent(0)).is.null
			expect(sched._getEvent(2).state).is.equal("A");
			expect(sched._getEvent(5.9).state).is.equal("A");
			expect(sched._getEvent(6.1).state).is.equal("B");
			expect(sched._getEvent(12).state).is.equal("C");
			sched.dispose();
		});

		it ("puts the second scheduled event after if two events are scheduled at the same time", function(){
			var sched = new Schedulable();
			sched._insertEvent({
				"name" : "A",
				"time"  : 0
			});
			sched._insertEvent({
				"name" : "B",
				"time"  : 0
			});
			expect(sched._getEvent(0).name).is.equal("B");
			sched._insertEvent({
				"name" : "C",
				"time"  : 0
			});
			expect(sched._getEvent(0).name).is.equal("C");
			sched.dispose();
		});
	});
});