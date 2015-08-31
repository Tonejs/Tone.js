define(["helper/Offline", "helper/Basic", "Tone/signal/Route", "Tone/signal/Signal", "Test", "Tone/component/Merge"], 
function (Offline, Basic, Route, Signal, Test, Merge) {

	describe("Route", function(){

		Basic(Route);

		describe("Routeing Logic", function(){

			it ("handles input and output connections", function(){
				var route = new Route();
				route.connect(Test);
				Test.connect(route);
				Test.connect(route.gate);
				route.dispose();
			});

			it("can route a signal to the first output", function(done){
				var signal, route, merge;
				var offline = new Offline(0.3, 2);
				offline.before(function(dest){
					signal = new Signal(10);
					route = new Route(2);
					merge = new Merge();
					signal.connect(route);
					route.connect(merge, 0, 0);
					route.connect(merge, 1, 1);
					merge.connect(dest);
				});
				offline.test(function(samples){
					expect(samples[0]).to.equal(10);
					expect(samples[1]).to.equal(0);
				});
				offline.after(function(){
					signal.dispose();
					route.dispose();
					merge.dispose();
					done();
				});
				offline.run();
			});

			it("can route a signal to the second output", function(done){
				var signal, route, merge;
				var offline = new Offline(0.3, 2);
				offline.before(function(dest){
					signal = new Signal(10);
					route = new Route(2);
					route.select(1);
					merge = new Merge();
					signal.connect(route);
					route.connect(merge, 0, 0);
					route.connect(merge, 1, 1);
					merge.connect(dest);
				});
				offline.test(function(samples){
					expect(samples[0]).to.equal(0);
					expect(samples[1]).to.equal(10);
				});
				offline.after(function(){
					signal.dispose();
					route.dispose();
					merge.dispose();
					done();
				});
				offline.run();
			});

			it("can schedule a route", function(done){
				var signal, route, merge;
				var offline = new Offline(0.5, 2);
				offline.before(function(dest){
					signal = new Signal(5);
					route = new Route(2);
					route.select(1, 0.3);
					merge = new Merge();
					signal.connect(route);
					route.connect(merge, 0, 0);
					route.connect(merge, 1, 1);
					merge.connect(dest);
				});
				offline.test(function(samples, time){
					if (time < 0.3){
						expect(samples[0]).to.equal(5);
						expect(samples[1]).to.equal(0);
					} else {
						expect(samples[0]).to.equal(0);
						expect(samples[1]).to.equal(5);
					}
				});
				offline.after(function(){
					signal.dispose();
					route.dispose();
					merge.dispose();
					done();
				});
				offline.run();
			});

			it("can handle 3 outputs", function(done){
				var signal, route, merge;
				var offline = new Offline(0.5, 2);
				offline.before(function(dest){
					signal = new Signal(5);
					route = new Route(3);
					route.select(1, 0);
					route.select(2, 0.3);
					merge = new Merge();
					signal.connect(route);
					route.connect(merge, 1, 0);
					route.connect(merge, 2, 1);
					merge.connect(dest);
				});
				offline.test(function(samples, time){
					if (time < 0.3){
						expect(samples[0]).to.equal(5);
						expect(samples[1]).to.equal(0);
					} else {
						expect(samples[0]).to.equal(0);
						expect(samples[1]).to.equal(5);
					}
				});
				offline.after(function(){
					signal.dispose();
					route.dispose();
					merge.dispose();
					done();
				});
				offline.run();
			});

		});
	});
});