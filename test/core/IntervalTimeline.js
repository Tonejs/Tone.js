import Test from "helper/Test";
import IntervalTimeline from "Tone/core/IntervalTimeline";
import Basic from "helper/Basic";

describe("IntervalTimeline", function(){

	Basic(IntervalTimeline);

	context("inserting/deleting events", function(){

		it("accepts events into the timeline", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"state" : "A",
				"duration" : 0.2,
				"time" : 0
			});
			sched.add({
				"state" : "B",
				"duration" : 0.4,
				"time" : 1
			});
			sched.add({
				"state" : "C",
				"duration" : 12,
				"time" : 2
			});
			sched.dispose();
		});

		it("computes the lenght of the timeline correctly after adding events", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"state" : "A",
				"duration" : 0.2,
				"time" : 0
			});
			sched.add({
				"state" : "B",
				"duration" : 0.4,
				"time" : 1
			});
			sched.add({
				"state" : "C",
				"duration" : 12,
				"time" : 2
			});
			expect(sched.length).to.equal(3);
			sched.dispose();
		});

		it("can remove events from the timeline", function(){
			var sched = new IntervalTimeline();

			var ev0 = {
				"duration" : 0.2,
				"time" : 0
			};
			var ev1 = {
				"duration" : 0.2,
				"time" : 0.2
			};
			var ev2 = {
				"duration" : 0.2,
				"time" : 0.1
			};
			sched.add(ev0);
			sched.add(ev1);
			sched.add(ev2);
			expect(sched.length).to.equal(3);
			sched.remove(ev0);
			sched.remove(ev1);
			expect(sched.length).to.equal(1);
			sched.remove(ev2);
			expect(sched.length).to.equal(0);
			sched.dispose();
		});

		it("removing on a null set does nothing", function(){
			var sched = new IntervalTimeline();
			expect(sched.length).to.equal(0);
			sched.remove({});
			expect(sched.length).to.equal(0);
			sched.dispose();
		});

		it("can add and remove and add again events from the timeline", function(){
			var sched = new IntervalTimeline();

			var ev0 = {
				"duration" : 0.2,
				"time" : 0
			};
			var ev1 = {
				"duration" : 0.2,
				"time" : 0.2
			};
			var ev2 = {
				"duration" : 0.2,
				"time" : 0.1
			};
			sched.add(ev0);
			sched.add(ev1);
			sched.add(ev2);
			expect(sched.length).to.equal(3);
			sched.remove(ev0);
			sched.remove(ev1);
			expect(sched.length).to.equal(1);
			sched.add(ev0);
			sched.add(ev1);
			expect(sched.length).to.equal(3);
			sched.dispose();
		});

		it("throws an error if events do not have both time and duration attributes", function(){
			var sched = new IntervalTimeline();
			expect(function(){
				sched.add({
					"time" : 0
				});
			}).to.throw(Error);
			expect(function(){
				sched.add({
					"duration" : 0
				});
			}).to.throw(Error);
			sched.dispose();
		});

	});

	context("getting events", function(){

		it("returns null when no events are in the timeline", function(){
			var sched = new IntervalTimeline();
			expect(sched.get(3)).to.equal(null);
			sched.dispose();
		});

		it("returns the event which overlaps the given time", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"state" : "A",
				"duration" : Infinity,
				"time" : 0
			});
			sched.add({
				"state" : "B",
				"duration" : 0.4,
				"time" : 1
			});
			sched.add({
				"state" : "C",
				"duration" : 12,
				"time" : 2
			});
			expect(sched.get(0.2).state).to.equal("A");
			sched.dispose();
		});

		it("returns events exclusive of the end time", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"state" : "A",
				"duration" : 1,
				"time" : 0
			});
			expect(sched.get(0.99).state).to.equal("A");
			expect(sched.get(1)).to.equal(null);
			sched.dispose();
		});

		it("factors in start position and duration when checking for overlaps", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"duration" : 0.4,
				"time" : 0
			});
			expect(sched.get(0.5)).to.be.null;
			expect(sched.get(-1)).to.be.null;
			expect(sched.get(0)).to.not.be.null;
			expect(sched.get(0.39)).to.not.be.null;
			sched.dispose();
		});

		it("returns the event whose start is closest to the given time", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"state" : "A",
				"duration" : Infinity,
				"time" : 0
			});
			sched.add({
				"state" : "B",
				"duration" : 0.4,
				"time" : 0.2
			});
			sched.add({
				"state" : "C",
				"duration" : 12,
				"time" : 2
			});
			expect(sched.get(0.2).state).to.equal("B");
			sched.dispose();
		});

		it("returns the events correctly after some events are removed", function(){
			var sched = new IntervalTimeline();
			var ev0 = {
				"state" : "A",
				"duration" : 0.2,
				"time" : 0.1
			};
			var ev1 = {
				"state" : "B",
				"duration" : 0.3,
				"time" : 0.2
			};
			var ev2 = {
				"state" : "C",
				"duration" : Infinity,
				"time" : 0
			};
			sched.add(ev0);
			sched.add(ev1);
			sched.add(ev2);
			sched.remove(ev0);
			sched.remove(ev1);
			expect(sched.get(0.2)).to.not.be.null;
			expect(sched.get(0.2).state).to.equal("C");
			sched.dispose();
		});

		it("can handle many items", function(){
			var sched = new IntervalTimeline();
			var len = 5000;
			var events = [];
			var duration = 1;
			var time = 0;
			for (var i = 0; i < len; i++){
				var event = {
					"time" : time,
					"duration" : duration
				};
				time = (time + 3.1) % 109;
				duration = (duration + 5.7) % 19;
				sched.add(event);
				events.push(event);
			}
			for (var j = 0; j < events.length; j++){
				var event = events[j];
				expect(sched.get(event.time).time).to.equal(event.time);
			}

			for (var k = 0; k < events.length; k++){
				sched.remove(events[k]);
				expect(sched.length).to.equal(events.length - k - 1);
			}
			sched.dispose();
		});

	});

	context("cancelling", function(){

		it("can cancel items after the given time", function(){
			var sched = new IntervalTimeline();
			for (var i = 5; i < 100; i++){
				sched.add({
					"time" : i,
					"duration" : 10
				});
			}
			sched.cancel(10);
			expect(sched.length).to.equal(5);
			sched.cancel(0);
			expect(sched.length).to.equal(0);
			sched.dispose();
		});

		it("can cancel items at the given time", function(){
			var sched = new IntervalTimeline();
			sched.add({
				"time" : 0,
				"duration" : 10
			});
			sched.cancel(1);
			expect(sched.length).to.equal(1);
			sched.cancel(0);
			expect(sched.length).to.equal(0);
			sched.dispose();
		});
	});

	context("Iterators", function(){

		it("iterates over all items and returns and item", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0, "duration" : 5 });
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEach(function(event){
				expect(event).to.be.an.object;
				count++;
			});
			expect(count).to.equal(5);
			sched.dispose();
		});

		it("iterate over null set", function(){
			var sched = new IntervalTimeline();
			var count = 0;
			sched.forEach(function(){
				count++;
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

		it("iterates over all items overlapping the given time", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0, "duration" : 5 });
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEachAtTime(0.3, function(event){
				expect(event).to.be.an.object;
				expect(event.time).to.be.at.most(0.3);
				count++;
			});
			expect(count).to.equal(4);
			sched.dispose();
		});

		it("handles time ranges before the available objects", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEachAtTime(0, function(){
				count++;
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

		it("handles time ranges after the available objects", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEachAtTime(5.5, function(){
				count++;
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

		it("iterates over all items after the given time", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEachFrom(0.2, function(event){
				expect(event).to.be.an.object;
				expect(event.time).to.be.gte(0.2);
				count++;
			});
			expect(count).to.equal(3);
			count = 0;
			sched.forEachFrom(0.35, function(event){
				expect(event.time).to.be.gte(0.35);
				count++;
			});
			expect(count).to.equal(1);
			sched.dispose();
		});

		it("handles time ranges after the available objects", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEachFrom(0.5, function(){
				count++;
			});
			expect(count).to.equal(0);
			sched.dispose();
		});

		it("iterates over all items", function(){
			var sched = new IntervalTimeline();
			sched.add({ "time" : 0.1, "duration" : 5 });
			sched.add({ "time" : 0.2, "duration" : 5 });
			sched.add({ "time" : 0.3, "duration" : 5 });
			sched.add({ "time" : 0.4, "duration" : 5 });
			var count = 0;
			sched.forEach(function(){
				count++;
			});
			expect(count).to.equal(4);
			sched.dispose();
		});

		it("can remove items during forEach iterations", function(){
			var sched = new IntervalTimeline();
			for (var i = 0; i < 1000; i++){
				sched.add({ "time" : i, "duration" : 0.01 });
			}
			sched.forEach(function(event){
				sched.cancel(event.time);
			});
			expect(sched.length).to.equal(0);
			sched.dispose();
		});

		it("can remove items during forEachAtTime iterations", function(){
			var sched = new IntervalTimeline();
			for (var i = 0; i < 1000; i++){
				sched.add({ "time" : i, "duration" : Infinity });
			}
			sched.forEachAtTime(1000, function(event){
				sched.cancel(event.time);
			});
			expect(sched.length).to.equal(0);
			sched.dispose();
		});

		it("can remove items during forEachFrom iterations", function(){
			var sched = new IntervalTimeline();
			for (var i = 0; i < 1000; i++){
				sched.add({ "time" : i, "duration" : Infinity });
			}
			sched.forEachFrom(0, function(event){
				sched.remove(event);
			});
			expect(sched.length).to.equal(0);
			sched.dispose();
		});
	});
});

