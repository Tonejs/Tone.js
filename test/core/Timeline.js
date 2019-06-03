import Test from "helper/Test";
import Timeline from "Tone/core/Timeline";

describe("Timeline", function(){

	it("can be created and disposed", function(){
		var sched = new Timeline();
		sched.dispose();
		Test.wasDisposed(sched);
	});

	it("accepts events into the timeline", function(){
		var sched = new Timeline();
		sched.add({
			"state" : "A",
			"time" : 0
		});
		sched.add({
			"state" : "B",
			"time" : 1
		});
		sched.add({
			"state" : "C",
			"time" : 2
		});
		sched.dispose();
	});

	it("can insert events in the timeline in the right order", function(){
		var sched = new Timeline();
		sched.add({
			"time" : 0
		});
		sched.add({
			"time" : 2
		});
		sched.add({
			"time" : 1
		});
		expect(sched._timeline[0].time).to.equal(0);
		expect(sched._timeline[1].time).to.equal(1);
		expect(sched._timeline[2].time).to.equal(2);
		sched.dispose();
	});

	it("can get the length of the timeline", function(){
		var sched = new Timeline();
		expect(sched.length).to.equal(0);
		sched.add({
			"time" : 0
		});
		expect(sched.length).to.equal(1);
		sched.dispose();
	});

	it("throws an error if no time is provided in object", function(){
		var sched = new Timeline();
		expect(function(){
			sched.add({
				"no_time" : 0
			});
		}).to.throw(Error);
		sched.dispose();
	});

	it("can remove items from the timeline", function(){
		var sched = new Timeline();
		var obj = { "time" : 0 };
		sched.add(obj);
		sched.add({
			"time" : 2
		});
		expect(sched.length).to.equal(2);
		sched.remove(obj);
		expect(sched.length).to.equal(1);
		sched.dispose();
	});

	it("has no effect to remove an object which is not there", function(){
		var sched = new Timeline();
		sched.add({
			"time" : 2
		});
		sched.remove({});
		expect(sched.length).to.equal(1);
		sched.forEach(function(event){
			sched.remove({});
		});
		expect(sched.length).to.equal(1);
		sched.dispose();
	});

	it("can search for events in the timeline by time", function(){
		var sched = new Timeline();
		sched.add({
			"time" : 0
		});
		sched.add({
			"time" : 2
		});
		sched.add({
			"time" : 1
		});
		expect(sched._search(0)).to.equal(0);
		expect(sched._search(0.01)).to.equal(0);
		expect(sched._search(1)).to.equal(1);
		expect(sched._search(1.01)).to.equal(1);
		expect(sched._search(2)).to.equal(2);
		expect(sched._search(20000)).to.equal(2);
		expect(sched._search(-1)).to.equal(-1);
		sched.dispose();
	});

	it("can get a previous event", function(){
		var sched = new Timeline();
		var event0 = {
			"time" : 0
		};
		var event1 = {
			"time" : 1
		};
		sched.add(event0);
		sched.add(event1);
		expect(sched.previousEvent(event1)).to.equal(event0);
		expect(sched.previousEvent(event0)).to.equal(null);
		sched.dispose();
	});

	it("can get the scheduled event at the given time", function(){
		var sched = new Timeline();
		sched.add({
			"state" : "A",
			"time" : 2
		});
		sched.add({
			"state" : "C",
			"time" : 9.4
		});
		sched.add({
			"state" : "B",
			"time" : 6
		});
		expect(sched.get(0)).is.null;
		expect(sched.get(2).state).is.equal("A");
		expect(sched.get(5.9).state).is.equal("A");
		expect(sched.get(6.1).state).is.equal("B");
		expect(sched.get(12).state).is.equal("C");
		sched.dispose();
	});

	it("puts the second scheduled event after if two events are scheduled at the same time", function(){
		var sched = new Timeline();
		sched.add({
			"name" : "A",
			"time" : 0
		});
		sched.add({
			"name" : "B",
			"time" : 0
		});
		expect(sched.get(0).name).is.equal("B");
		sched.add({
			"name" : "C",
			"time" : 0
		});
		expect(sched.get(0).name).is.equal("C");
		sched.dispose();
	});

	it("can the next event after the given time", function(){
		var sched = new Timeline();
		expect(sched.getAfter(0)).is.null;
		sched.add({
			"state" : "A",
			"time" : 0.1
		});
		sched.add({
			"state" : "B",
			"time" : 1.1
		});
		sched.add({
			"state" : "C",
			"time" : 2.1
		});
		expect(sched.getAfter(0).state).is.equal("A");
		expect(sched.getAfter(1).state).is.equal("B");
		expect(sched.getAfter(3)).is.null;
		sched.dispose();
	});

	it("can the event before the event before the given time", function(){
		var sched = new Timeline();
		expect(sched.getBefore(0)).is.null;
		sched.add({
			"state" : "A",
			"time" : 0.1
		});
		sched.add({
			"state" : "B",
			"time" : 1.1
		});
		sched.add({
			"state" : "C",
			"time" : 2.1
		});
		expect(sched.getBefore(0)).is.null;
		expect(sched.getBefore(1.1).state).is.equal("A");
		expect(sched.getBefore(2.1).state).is.equal("B");
		expect(sched.getBefore(3).state).is.equal("C");
		sched.dispose();
	});

	it("can cancel an item", function(){
		var sched = new Timeline();
		sched.add({ "time" : 3 });
		sched.add({ "time" : 5 });
		sched.add({ "time" : 4 });
		sched.add({ "time" : 8 });
		sched.add({ "time" : 5 });
		expect(sched.length).to.equal(5);
		sched.cancel(10);
		expect(sched.length).to.equal(5);
		sched.cancel(5);
		expect(sched.length).to.equal(2);
		sched.cancel(3);
		expect(sched.length).to.equal(0);
		sched.dispose();
	});

	it("can cancel items after the given time", function(){
		var sched = new Timeline();
		for (var i = 0; i < 100; i++){
			sched.add({ "time" : 100 - i });
		}
		sched.cancel(10);
		expect(sched.length).to.equal(9);
		sched.cancel(5);
		expect(sched.length).to.equal(4);
		sched.cancel(0);
		expect(sched.length).to.equal(0);
		sched.dispose();
	});

	it("can cancel items before the given time", function(){
		var sched = new Timeline();
		for (var i = 0; i < 100; i++){
			sched.add({ "time" : i });
		}
		sched.cancelBefore(9);
		expect(sched.length).to.equal(90);
		sched.cancelBefore(10.1);
		expect(sched.length).to.equal(89);
		sched.cancelBefore(100);
		expect(sched.length).to.equal(0);
		sched.dispose();
	});

	it("has no problem with many items", function(){
		var sched = new Timeline();
		for (var i = 0; i < 10000; i++){
			sched.add({
				"time" : i
			});
		}
		for (var j = 0; j < 10000; j++){
			expect(sched.get(j).time).to.equal(j);
		}
		sched.dispose();
	});

	it("can constrain the length of the timeline", function(){
		var sched = new Timeline(4);
		for (var i = 0; i < 10000; i++){
			sched.add({
				"time" : i
			});
		}
		expect(sched.length).to.equal(4);
		sched.dispose();
	});

	it("can peek and shift off the first element", function(){
		var timeline = new Timeline();
		timeline.add({
			"time" : 0,
			"value" : "a"
		});
		timeline.add({
			"time" : 1,
			"value" : "b"
		});
		timeline.add({
			"time" : 2,
			"value" : "c"
		});
		expect(timeline.length).to.equal(3);
		expect(timeline.peek().value).to.equal("a");
		expect(timeline.length).to.equal(3);
		expect(timeline.shift().value).to.equal("a");
		expect(timeline.length).to.equal(2);
		expect(timeline.peek().value).to.equal("b");
		expect(timeline.shift().value).to.equal("b");
		expect(timeline.length).to.equal(1);
		timeline.dispose();
	});

	context("Iterators", function(){

		it("forEach is invoked with the timeline as the context", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			sched.forEach(function(){
				expect(this).to.equal(sched);
			});
			sched.dispose();
		});

		it("forEachBefore is invoked with the timeline as the context", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			sched.forEachBefore(0.5, function(){
				expect(this).to.equal(sched);
			});
			sched.dispose();
		});

		it("forEachAfter is invoked with the timeline as the context", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			sched.forEachAfter(0.5, function(){
				expect(this).to.equal(sched);
			});
			sched.dispose();
		});

		it("forEachFrom is invoked with the timeline as the context", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			sched.forEachFrom(0.5, function(){
				expect(this).to.equal(sched);
			});
			sched.dispose();
		});

		it("forEachAtTime is invoked with the timeline as the context", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			sched.forEachAtTime(0.5, function(){
				expect(this).to.equal(sched);
			});
			sched.dispose();
		});

		it("iterates over all items and returns and item", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEach(function(event){
				expect(event).to.be.an.object;
				count++;
			});
			expect(count).to.equal(5);
			sched.dispose();
		});

		it("iterates over all items before the given time", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachBefore(0.3, function(event){
				expect(event).to.be.an.object;
				expect(event.time).to.be.at.most(0.3);
				count++;
			});
			expect(count).to.equal(4);
			sched.dispose();
		});

		it("handles time ranges before the available objects", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachBefore(0, function(){
				count++;
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

		it("iterates over all items after the given time", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachAfter(0.1, function(event){
				expect(event).to.be.an.object;
				expect(event.time).to.be.above(0.1);
				count++;
			});
			expect(count).to.equal(3);
			sched.dispose();
		});

		it("handles time ranges after the available objects", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachAfter(0.5, function(){
				count++;
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

		it("handles time ranges before the first object", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachAfter(-Infinity, function(){
				count++;
			});
			expect(count).to.equal(4);
			sched.dispose();
		});

		it("can iterate after inclusive of the item at the given time", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachFrom(0.2, function(){
				count++;
			});
			expect(count).to.equal(4);
			count = 0;
			sched.forEachFrom(0.21, function(){
				count++;
			});
			expect(count).to.equal(2);
			count = 0;
			sched.forEachFrom(0, function(){
				count++;
			});
			expect(count).to.equal(5);
			sched.dispose();
		});

		it("iterates over all items at the given time", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachAtTime(0.1, function(event){
				count++;
			});
			expect(count).to.equal(0);
			//and with an actual time
			sched.forEachAtTime(0.2, function(event){
				expect(event.time).to.equal(0.2);
				count++;
			});
			expect(count).to.equal(2);
			sched.dispose();
		});

		it("can remove items during iterations", function(){
			var sched = new Timeline();
			for (var i = 0; i < 1000; i++){
				sched.add({ "time" : i });
			}
			sched.forEach(function(event){
				sched.remove(event);
			});
			expect(sched.length).to.equal(0);
			sched.dispose();
		});

		it("can add items during iteration", function(){
			var sched = new Timeline();
			for (var i = 0; i < 1000; i++){
				sched.add({ "time" : i });
			}
			var added = false;
			sched.forEach(function(event){
				if (!added){
					added = true;
					sched.add({
						"time" : 10,
						"added" : true,
					});
				}
			});
			expect(sched.length).to.equal(1001);
			sched.dispose();
		});

		it("can iterate between a time range", function(){
			var sched = new Timeline();
			sched.add({ "time" : 0.1 });
			sched.add({ "time" : 0.2 });
			sched.add({ "time" : 0.3 });
			sched.add({ "time" : 0.4 });
			var count = 0;
			sched.forEachBetween(0.2, 0.4, function(event){
				count++;
				expect(event.time).to.be.within(0.2, 0.3);
			});
			expect(count).to.equal(2);
			count = 0;
			sched.forEachBetween(0.21, 0.4, function(event){
				count++;
				expect(event.time).to.be.within(0.21, 0.3);
			});
			expect(count).to.equal(1);
			count = 0;
			sched.forEachBetween(0.21, 0.39, function(event){
				count++;
				expect(event.time).to.be.within(0.21, 0.39);
			});
			expect(count).to.equal(1);
			count = 0;
			sched.forEachBetween(0, 0.11, function(event){
				count++;
				expect(event.time).to.be.within(0, 0.11);
			});
			expect(count).to.equal(1);
			count = 0;
			sched.forEachBetween(0, 0.09, function(event){
				count++;
				expect(event.time).to.be.within(0, 0.09);
			});
			expect(count).to.equal(0);
			count = 0;
			sched.forEachBetween(0.41, 0.5, function(event){
				count++;
				expect(event.time).to.be.within(0.41, 0.5);
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

	});
});

