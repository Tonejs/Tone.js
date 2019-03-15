import Basic from "helper/Basic";
import Test from "helper/Test";
import TimeBase from "Tone/type/TimeBase";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";

describe("TimeBase", function(){

	Basic(TimeBase);

	context("Constructor", function(){

		it("can be made with or without 'new'", function(){
			var t0 = TimeBase();
			expect(t0).to.be.instanceOf(TimeBase);
			t0.dispose();
			var t1 = new TimeBase();
			expect(t1).to.be.instanceOf(TimeBase);
			t1.dispose();
		});

		it("can pass in a number in the constructor", function(){
			var time = TimeBase(1);
			expect(time).to.be.instanceOf(TimeBase);
			expect(time.valueOf()).to.equal(1);
			time.dispose();
		});

		it("can pass in a string in the constructor", function(){
			var time = TimeBase("1");
			expect(time).to.be.instanceOf(TimeBase);
			expect(time.valueOf()).to.equal(1);
			time.dispose();
		});

		it("can pass in a TimeBase in the constructor", function(){
			var arg = TimeBase(1);
			var time = TimeBase(arg);
			expect(time.valueOf()).to.equal(1);
			time.dispose();
		});

		it("can pass in a value and a type", function(){
			expect(TimeBase(4, "n").valueOf()).to.equal(0.5);
			expect(TimeBase("4", "n").valueOf()).to.equal(0.5);
		});

		it("can pass in a another Timebase", function(){
			var param = TimeBase(4, "n");
			expect(param.valueOf()).to.equal(TimeBase(param).valueOf());
			expect(param.valueOf()).to.equal(TimeBase(param).valueOf());
		});

	});

	context("Eval", function(){

		it("evaluates numbers as seconds", function(){
			expect(TimeBase("1").valueOf()).to.equal(1);
			expect(TimeBase(2, "s").valueOf()).to.equal(2);
			expect(TimeBase(3.2).valueOf()).to.equal(3.2);
		});

		it("evaluates notation", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(TimeBase("4n").valueOf()).to.equal(0.5);
				expect(TimeBase("8n").valueOf()).to.equal(0.25);
				expect(TimeBase(16, "n").valueOf()).to.equal(0.125);
				expect(TimeBase("32n").valueOf()).to.equal(0.5/8);
				expect(TimeBase("32n.").valueOf()).to.equal(0.5/8 * 1.5);
				expect(TimeBase("2t").valueOf()).to.equal(2/3);
				Transport.bpm.value = 60;
				Transport.timeSignature = [5, 4];
				expect(TimeBase("1m").valueOf()).to.equal(5);
				expect(TimeBase(2, "m").valueOf()).to.equal(10);
				expect(TimeBase("5m").valueOf()).to.equal(25);
			});
		});

		it("evalutes hertz", function(){
			expect(TimeBase("1hz").valueOf()).to.equal(1);
			expect(TimeBase("2hz").valueOf()).to.equal(0.5);
			expect(TimeBase(4, "hz").valueOf()).to.equal(0.25);
			expect(TimeBase("0.25hz").valueOf()).to.equal(4);
		});

		it("evalutes ticks", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(TimeBase(Transport.PPQ, "i").valueOf()).to.equal(0.5);
				expect(TimeBase(1, "i").valueOf()).to.equal(0.5 / Transport.PPQ);
			});
		});

		it("evalutes objects", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(TimeBase({ "4n" : 3 }).valueOf()).to.equal(1.5);
				expect(TimeBase({ "8t" : 2, "1m" : 3 }).valueOf()).to.be.closeTo(6.33, 0.01);
				expect(TimeBase({ "2n" : 1, "8n" : 1 }).valueOf()).to.equal(1.25);
			});
		});

		it("evalutes transport time", function(){
			return Offline(function(Transport){
				Transport.bpm.value = 120;
				Transport.timeSignature = 4;
				expect(TimeBase("1:0:0").valueOf()).to.equal(2);
				expect(TimeBase("0:3:2").valueOf()).to.equal(1.75);
				expect(TimeBase("0:0:2.2").valueOf()).to.equal(0.275);
			});
		});

		it("is evaluated in equations and comparisons using valueOf", function(){
			expect(TimeBase(1) + 1).to.equal(2);
			expect(TimeBase(1) + TimeBase(1)).to.equal(2);
			expect(TimeBase(1) > TimeBase(0)).to.be.true;
			expect(+TimeBase(1)).to.equal(1);
		});
	});

});

