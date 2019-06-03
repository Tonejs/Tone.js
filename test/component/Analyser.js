import Analyser from "Tone/component/Analyser";
import Test from "helper/Test";
import Basic from "helper/Basic";
import Noise from "Tone/source/Noise";

describe("Analyser", function(){

	Basic(Analyser);

	it("handles input connection", function(){
		var anl = new Analyser();
		Test.connect(anl);
		anl.dispose();
	});

	it("can get and set properties", function(){
		var anl = new Analyser();
		anl.set({
			"size" : 32,
			"smoothing" : 0.2
		});
		var values = anl.get();
		expect(values.size).to.equal(32);
		expect(values.smoothing).to.equal(0.2);
		anl.dispose();
	});

	it("can correctly set the size", function(){
		var anl = new Analyser("fft", 512);
		expect(anl.size).to.equal(512);
		anl.size = 1024;
		expect(anl.size).to.equal(1024);
		anl.dispose();
	});

	it("can run fft analysis", function(){
		var anl = new Analyser("fft", 512);
		var analysis = anl.getValue();
		expect(analysis.length).to.equal(512);
		for (var i = 0; i < analysis.length; i++){
			expect(analysis[i]).is.lessThan(0);
		}
		anl.dispose();
	});

	it("can run waveform analysis", function(done){
		var noise = new Noise();
		var anl = new Analyser("waveform", 256);
		noise.connect(anl);
		noise.start();

		setTimeout(function(){
			var analysis = anl.getValue();
			expect(analysis.length).to.equal(256);
			for (var i = 0; i < analysis.length; i++){
				expect(analysis[i]).is.within(-1, 1);
			}
			anl.dispose();
			noise.dispose();
			done();
		}, 300);
	});

	it("throws an error if an invalid type is set", function(){
		var anl = new Analyser("fft", 512);
		expect(function(){
			anl.type = "invalid";
		}).to.throw(Error);
		anl.dispose();
	});

});

