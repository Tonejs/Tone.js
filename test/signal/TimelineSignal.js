define(["Test", "Tone/signal/TimelineSignal", "helper/Offline", "Tone/type/Type", 
	"helper/Offline2", "helper/Supports"], 
	function (Test, TimelineSignal, Offline, Tone, Offline2, Supports) {

	describe("TimelineSignal", function(){

		it("can be created and disposed", function(){
			var sched = new TimelineSignal();
			sched.dispose();
			Test.wasDisposed(sched);
		});

		it("can schedule a change in the future", function(){
			var sched = new TimelineSignal(1);
			sched.setValueAtTime(2, 0.2);
			sched.dispose();
		});

		it("can schedule a ramp in the future", function(){
			var sched = new TimelineSignal(1);
			sched.setValueAtTime(2, 0);
			sched.linearRampToValueAtTime(0.1, 0.2);
			sched.exponentialRampToValueAtTime(1, 0.4);
			sched.setTargetAtTime(0.5, 0.45, 1);
			sched.dispose();
		});

		it("can get a setValueAtTime value in the future", function(){
			var sched = new TimelineSignal(1);
			sched.setValueAtTime(0, 0);
			sched.setValueAtTime(1, 1);
			sched.setValueAtTime(2, 2);
			sched.setValueAtTime(3, 3);
			expect(sched.getValueAtTime(0)).to.equal(0);
			expect(sched.getValueAtTime(1)).to.equal(1);
			expect(sched.getValueAtTime(1.1)).to.equal(1);
			expect(sched.getValueAtTime(2)).to.equal(2);
			expect(sched.getValueAtTime(3)).to.equal(3);
			expect(sched.getValueAtTime(4)).to.equal(3);
			sched.dispose();
		});

		it("can get linear ramp value in the future", function(){
			var sched = new TimelineSignal(1);
			sched.setValueAtTime(0, 0);
			sched.linearRampToValueAtTime(1, 1);
			sched.linearRampToValueAtTime(0, 2);
			expect(sched.getValueAtTime(0)).to.equal(0);
			expect(sched.getValueAtTime(0.5)).to.equal(0.5);
			expect(sched.getValueAtTime(1)).to.equal(1);
			expect(sched.getValueAtTime(1.5)).to.equal(0.5);
			expect(sched.getValueAtTime(2)).to.equal(0);
			sched.dispose();
		});

		it("can get exponential ramp value in the future", function(done){
			var sched;
			var offline = new Offline(2);
			offline.before(function(dest){
				sched = new TimelineSignal().connect(dest);
				sched.setValueAtTime(0.5, 0);
				sched.exponentialRampToValueAtTime(1, 1);
				sched.exponentialRampToValueAtTime(0.5, 2);
			});
			offline.test(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.01);
			});
			offline.after(function(){
				sched.dispose();
				done();
			});
			offline.run();
		});

		it("can get set target value in the future", function(done){
			var sched;
			var offline = new Offline(2);
			offline.before(function(dest){
				sched = new TimelineSignal(1).connect(dest);
				sched.setValueAtTime(1, 0);
				sched.setTargetAtTime(0.5, 0.5, 2);
			});
			offline.test(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.01);
			});
			offline.after(function(){
				sched.dispose();
				done();
			});
			offline.run();
		});
			
		it("can get set a curve in the future", function(done){
			Offline2(function(dest, test, after){
				var sched = new TimelineSignal(1).connect(dest);
				sched.setValueCurveAtTime([0, 1, 0.2, 0.8, 0], 0, 1);

				test(function(sample, time){
					expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.03);
				});

				after(function(){
					sched.dispose();
					done();
				});
			}, 1);
		});

		it("can scale a curve value", function(done){
			Offline2(function(dest, test, after){
				var sched = new TimelineSignal(1).connect(dest);
				sched.setValueCurveAtTime([0, 1, 0], 0, 1, 0.5);

				test(function(sample){
					expect(sample).to.be.at.most(0.51);
				});

				after(function(){
					sched.dispose();
					done();
				});
			}, 1);
		});

		if (Supports.ACCURATE_SIGNAL_SCHEDULING){
			
			it("can match a complex scheduled curve", function(done){
				var sched;
				var offline = new Offline(4);
				offline.before(function(dest){
					sched = new TimelineSignal(1).connect(dest);
					sched.setValueAtTime(0.2, 0.3);
					sched.setTargetAtTime(0.5, 0.5, 2);
					sched.setValueAtTime(0.4, 1);
					sched.linearRampToValueAtTime(5, 1.4);
					sched.exponentialRampToValueAtTime(2, 1.6);
					sched.setValueAtTime(2.5, 2);
					sched.linearRampToValueAtTime(2.4, 2.5);
					sched.linearRampToValueAtTime(5, 3);
					sched.setTargetAtTime(2, 3.5, 5);
					sched.setValueCurveAtTime([0, 1, 0], 3.8, 0.2);
				});
				offline.test(function(sample, time){
					expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.01);
				});
				offline.after(function(){
					sched.dispose();
					done();
				});
				offline.run();
			});
		}

		it("can schedule a linear ramp between two times", function(){
			var sched = new TimelineSignal(0);
			sched.linearRampToValueBetween(1, 1, 2);
			expect(sched.getValueAtTime(0)).to.equal(0);
			expect(sched.getValueAtTime(0.5)).to.equal(0);
			expect(sched.getValueAtTime(1)).to.equal(0);
			expect(sched.getValueAtTime(1.5)).to.equal(0.5);
			expect(sched.getValueAtTime(2)).to.equal(1);
		});

		it("can get exponential ramp value between two times", function(done){
			var sched;
			var offline = new Offline(2);
			offline.before(function(dest){
				sched = new TimelineSignal(1).connect(dest);
				sched.linearRampToValueBetween(3, 1, 2);
			});
			offline.test(function(sample, time){
				expect(sample).to.be.closeTo(sched.getValueAtTime(time), 0.01);
			});
			offline.after(function(){
				sched.dispose();
				done();
			});
			offline.run();
		});

		it("can automate values with different units", function(done){
			var sched;
			var offline = new Offline(1.2);
			offline.before(function(dest){
				sched = new TimelineSignal(-10, Tone.Type.Decibels).connect(dest);
				sched.setValueAtTime(-5, 0);
				sched.linearRampToValueAtTime(-12, 0.5);
				sched.exponentialRampToValueBetween(-6, 1, 1.1);
			});
			offline.test(function(sample, time){
				if (time < 0.5){
					expect(sample).to.be.within(sched.dbToGain(-12), sched.dbToGain(-5));
				} else if (time < 1){
					expect(sample).to.be.a.percentageFrom(sched.dbToGain(-12), 0.01);
				} else if (time > 1.1){
					expect(sample).to.be.a.percentageFrom(sched.dbToGain(-6), 0.01);
				}
			});
			offline.after(function(){
				sched.dispose();
				done();
			});
			offline.run();
		});
	});
});