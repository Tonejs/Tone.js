define(["Tone/component/FFT", "Test", "helper/Basic", "Tone/source/Noise"],
	function (FFT, Test, Basic, Noise) {

		describe("FFT", function(){

			Basic(FFT);

			it("handles input connection", function(){
				var fft = new FFT();
				Test.connect(fft);
				fft.dispose();
			});

			it("can get and set properties", function(){
				var fft = new FFT();
				fft.set({
					"size" : 128
				});
				var values = fft.get();
				expect(values.size).to.equal(128);
				fft.dispose();
			});

			it("can correctly set the size", function(){
				var fft = new FFT(512);
				expect(fft.size).to.equal(512);
				fft.size = 1024;
				expect(fft.size).to.equal(1024);
				fft.dispose();
			});

			it("can run waveform analysis", function(done){
				var noise = new Noise();
				var fft = new FFT(256);
				noise.connect(fft);
				noise.start();

				setTimeout(function(){
					analysis = fft.getValue();
					expect(analysis.length).to.equal(256);
					for (i = 0; i < analysis.length; i++){
						expect(analysis[i]).is.within(-Infinity, 0);
					}
					fft.dispose();
					noise.dispose();
					done();
				}, 300);
			});

		});
	});
