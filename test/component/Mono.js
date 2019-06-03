import Mono from "Tone/component/Mono";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Offline from "helper/Offline";
import Signal from "Tone/signal/Signal";
import StereoSignal from "helper/StereoSignal";

describe("Mono", function(){

	Basic(Mono);

	context("Mono", function(){

		it("handles input and output connections", function(){
			var mono = new Mono();
			Test.connect(mono);
			mono.connect(Test);
			mono.dispose();
		});

		it("Makes a mono signal in both channels", function(){
			return Offline(function(){
				var mono = new Mono().toMaster();
				var signal = new Signal(2).connect(mono);
			}, 0.1, 2).then(function(buffer){
				expect(buffer.toArray()[0][0]).to.equal(2);
				expect(buffer.toArray()[1][0]).to.equal(2);
				expect(buffer.toArray()[0][100]).to.equal(2);
				expect(buffer.toArray()[1][100]).to.equal(2);
				expect(buffer.toArray()[0][1000]).to.equal(2);
				expect(buffer.toArray()[1][1000]).to.equal(2);
			});
		});

		it("Sums a stereo signal into a mono signal", function(){
			return Offline(function(){
				var mono = new Mono().toMaster();
				var signal = StereoSignal(2, 2).connect(mono);
			}, 0.1, 2).then(function(buffer){
				expect(buffer.toArray()[0][0]).to.equal(2);
				expect(buffer.toArray()[1][0]).to.equal(2);
				expect(buffer.toArray()[0][100]).to.equal(2);
				expect(buffer.toArray()[1][100]).to.equal(2);
				expect(buffer.toArray()[0][1000]).to.equal(2);
				expect(buffer.toArray()[1][1000]).to.equal(2);
			});
		});
	});
});

