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
			sched.addEvent({
				"state" : "A",
				"time"  : 0
			});
			sched.addEvent({
				"state" : "B",
				"time"  : 1
			});
			sched.addEvent({
				"state" : "C",
				"time"  : 2
			});
			sched.dispose();
		});

		it ("can insert events in the timeline in the right order", function(){
			var sched = new Schedulable();
			sched.addEvent({
				"time"  : 0
			});
			sched.addEvent({
				"time"  : 2
			});
			sched.addEvent({
				"time"  : 1
			});
			expect(sched._timeline[0].time).to.equal(0);
			expect(sched._timeline[1].time).to.equal(1);
			expect(sched._timeline[2].time).to.equal(2);
			sched.dispose();
		});

		it ("can search for events in the timeline by time", function(){
			var sched = new Schedulable();
			sched.addEvent({
				"time"  : 0
			});
			sched.addEvent({
				"time"  : 2
			});
			sched.addEvent({
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
			sched.addEvent({
				"state" : "A",
				"time"  : 2
			});
			sched.addEvent({
				"state" : "C",
				"time"  : 9.4
			});
			sched.addEvent({
				"state" : "B",
				"time"  : 6
			});
			expect(sched.getEvent(0)).is.null
			expect(sched.getEvent(2).state).is.equal("A");
			expect(sched.getEvent(5.9).state).is.equal("A");
			expect(sched.getEvent(6.1).state).is.equal("B");
			expect(sched.getEvent(12).state).is.equal("C");
			sched.dispose();
		});

		it ("puts the second scheduled event after if two events are scheduled at the same time", function(){
			var sched = new Schedulable();
			sched.addEvent({
				"name" : "A",
				"time"  : 0
			});
			sched.addEvent({
				"name" : "B",
				"time"  : 0
			});
			expect(sched.getEvent(0).name).is.equal("B");
			sched.addEvent({
				"name" : "C",
				"time"  : 0
			});
			expect(sched.getEvent(0).name).is.equal("C");
			sched.dispose();
		});

		it ("can the next event after the given time", function(){
			var sched = new Schedulable();
			sched.addEvent({
				"state" : "A",
				"time"  : 0.1
			});
			sched.addEvent({
				"state" : "B",
				"time"  : 1.1
			});
			sched.addEvent({
				"state" : "C",
				"time"  : 2.1
			});
			expect(sched.getNextEvent(0).state).is.equal("A");
			expect(sched.getNextEvent(1).state).is.equal("B");
			expect(sched.getNextEvent(3)).is.null;
			sched.dispose();
		});
	});
});