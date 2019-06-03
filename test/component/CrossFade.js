import CrossFade from "Tone/component/CrossFade";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
describe("CrossFade", function(){

	Basic(CrossFade);

	context("Fading", function(){

		it("handles input and output connections", function(){
			var comp = new CrossFade();
			Test.connect(comp, 0);
			Test.connect(comp, 1);
			comp.connect(Test);
			comp.dispose();
		});

		it("pass 100% of input 0", function(){
			return Offline(function(){
				var crossFade = new CrossFade();
				var drySignal = new Signal(10);
				var wetSignal = new Signal(20);
				drySignal.connect(crossFade, 0, 0);
				wetSignal.connect(crossFade, 0, 1);
				crossFade.fade.value = 0;
				crossFade.toMaster();
			}).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.closeTo(10, 0.01);
				});
			});
		});

		it("pass 100% of input 1", function(){
			return Offline(function(){
				var crossFade = new CrossFade();
				var drySignal = new Signal(10);
				var wetSignal = new Signal(20);
				drySignal.connect(crossFade, 0, 0);
				wetSignal.connect(crossFade, 0, 1);
				crossFade.fade.value = 1;
				crossFade.toMaster();
			}).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.closeTo(20, 0.01);
				});
			});
		});
		
		it("can mix two signals", function(){
			return Offline(function(){
				var crossFade = new CrossFade();
				var drySignal = new Signal(2);
				var wetSignal = new Signal(1);
				drySignal.connect(crossFade, 0, 0);
				wetSignal.connect(crossFade, 0, 1);
				crossFade.fade.value = 0.5;
				crossFade.toMaster();
			}).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.closeTo(2.12, 0.01);
				});
			});
		});
	});
});

