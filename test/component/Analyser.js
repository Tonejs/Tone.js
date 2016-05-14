define(["Tone/component/Analyser", "Test", "helper/Basic", "helper/Supports"], 
	function (Analyser, Test, Basic, Supports) {

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
				"maxDecibels" : -20,
				"minDecibels" : -80,
				"smoothing" : 0.2
			});
			var values = anl.get();
			expect(values.size).to.equal(32);
			expect(values.minDecibels).to.equal(-80);
			expect(values.maxDecibels).to.equal(-20);
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

		it("can run fft analysis in both bytes and floats", function(){
			var anl = new Analyser("fft", 512);
			anl.returnType = "byte";
			var analysis = anl.analyse();
			expect(analysis.length).to.equal(512);
			var i;
			for (i = 0; i < analysis.length; i++){
				expect(analysis[i]).is.within(0, 255);
			}
			anl.returnType = "float";
			analysis = anl.analyse();
			expect(analysis.length).to.equal(512);
			for (i = 0; i < analysis.length; i++){
				expect(analysis[i]).is.lessThan(anl.maxDecibels);
			}
			anl.dispose();
		});

		it("can run waveform analysis in both bytes and floats", function(){
			var anl = new Analyser("waveform", 256);
			anl.returnType = "byte";
			var analysis = anl.analyse();
			expect(analysis.length).to.equal(256);
			var i;
			for (i = 0; i < analysis.length; i++){
				expect(analysis[i]).is.within(0, 255);
			}
			anl.returnType = "float";
			analysis = anl.analyse();
			expect(analysis.length).to.equal(256);
			for (i = 0; i < analysis.length; i++){
				expect(analysis[i]).is.within(0, 1);
			}
			anl.dispose();
		});

	});
});