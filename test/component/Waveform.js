import Waveform from "Tone/component/Waveform";
import Test from "helper/Test";
import Basic from "helper/Basic";
import Noise from "Tone/source/Noise";

describe("Waveform", function(){

	Basic(Waveform);

	it("handles input connection", function(){
		var anl = new Waveform();
		Test.connect(anl);
		anl.dispose();
	});

	it("can get and set properties", function(){
		var anl = new Waveform();
		anl.set({
			"size" : 128
		});
		var values = anl.get();
		expect(values.size).to.equal(128);
		anl.dispose();
	});

	it("can correctly set the size", function(){
		var anl = new Waveform(512);
		expect(anl.size).to.equal(512);
		anl.size = 1024;
		expect(anl.size).to.equal(1024);
		anl.dispose();
	});

	it("can run waveform analysis", function(done){
		var noise = new Noise();
		var anl = new Waveform(256);
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

});

