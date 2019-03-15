import Solo from "Tone/component/Solo";
import Basic from "helper/Basic";
import ConstantOutput from "helper/ConstantOutput";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
describe("Solo", function(){

	Basic(Solo);

	context("Soloing", function(){

		it("handles input and output connections", function(){
			var solo = new Solo();
			Test.connect(solo);
			solo.connect(Test);
			solo.dispose();
		});

		it("can be soloed an unsoloed", function(){
			var sol = new Solo();
			sol.solo = true;
			expect(sol.solo).to.be.true;
			sol.solo = false;
			expect(sol.solo).to.be.false;
			sol.dispose();
		});

		it("can be passed into the constructor", function(){
			var sol = new Solo(true);
			expect(sol.solo).to.be.true;
			sol.dispose();
		});

		it("can be passed into the constructor with an object", function(){
			var sol = new Solo({ "solo" : true });
			expect(sol.solo).to.be.true;
			sol.dispose();
		});

		it("other instances are unsoloed when one is soloed", function(){
			var solA = new Solo();
			var solB = new Solo();
			solA.solo = true;
			solB.solo = false;
			expect(solA.solo).to.be.true;
			expect(solB.solo).to.be.false;
			solB.solo = true;
			expect(solA.solo).to.be.true;
			expect(solB.solo).to.be.true;
			solA.solo = false;
			expect(solA.solo).to.be.false;
			expect(solB.solo).to.be.true;
			solA.dispose();
			solB.dispose();
		});

		it("other instances report themselves as muted", function(){
			var solA = new Solo();
			var solB = new Solo();
			solA.solo = true;
			solB.solo = false;
			expect(solA.muted).to.be.false;
			expect(solB.muted).to.be.true;
			solA.dispose();
			solB.dispose();
		});

		it("all instances are unmuted when there is no solo", function(){
			var solA = new Solo();
			var solB = new Solo();
			solA.solo = true;
			solB.solo = false;
			solA.solo = false;
			expect(solA.muted).to.be.false;
			expect(solB.muted).to.be.false;
			solA.dispose();
			solB.dispose();
		});

		it("a newly created instance will be muted if there is already a soloed instance", function(){
			var solA = new Solo(true);
			var solB = new Solo();
			expect(solA.muted).to.be.false;
			expect(solB.muted).to.be.true;
			solA.dispose();
			solB.dispose();
		});

		it("passes both signals when nothing is soloed", function(){
			return ConstantOutput(function(){
				var soloA = new Solo().toMaster();
				var soloB = new Solo().toMaster();
				new Signal(10).connect(soloA);
				new Signal(20).connect(soloB);
			}, 30, 0.01);
		});

		it("passes one signal when it is soloed", function(){
			return ConstantOutput(function(){
				var soloA = new Solo().toMaster();
				var soloB = new Solo().toMaster();
				new Signal(10).connect(soloA);
				new Signal(20).connect(soloB);
				soloA.solo = true;
			}, 10, 0.01);
		});

		it("can solo multiple at once", function(){
			return ConstantOutput(function(){
				var soloA = new Solo().toMaster();
				var soloB = new Solo().toMaster();
				new Signal(10).connect(soloA);
				new Signal(20).connect(soloB);
				soloA.solo = true;
				soloB.solo = true;
			}, 30, 0.01);
		});

		it("can unsolo all", function(){
			return ConstantOutput(function(){
				var soloA = new Solo().toMaster();
				var soloB = new Solo().toMaster();
				new Signal(10).connect(soloA);
				new Signal(20).connect(soloB);
				soloA.solo = true;
				soloB.solo = true;
				soloA.solo = false;
				soloB.solo = false;
			}, 30, 0.01);
		});

		it("can solo and unsolo while keeping previous soloed", function(){
			return ConstantOutput(function(){
				var soloA = new Solo().toMaster();
				var soloB = new Solo().toMaster();
				new Signal(10).connect(soloA);
				new Signal(20).connect(soloB);
				soloA.solo = true;
				soloB.solo = true;
				soloB.solo = false;
			}, 10, 0.01);
		});

	});
});

