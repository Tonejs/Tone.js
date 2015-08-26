define(["helper/Offline", "helper/Basic", "Tone/signal/WaveShaper", "Tone/signal/Signal"], 
function (Offline, Basic, WaveShaper, Signal) {

	describe("WaveShaper", function(){

		Basic(WaveShaper);

		describe("Construction Options", function(){

			it ("can be constructed with an array", function(){
				var waveshaper = new WaveShaper([1, 2, 3, 4, 5, 6]);
				expect(waveshaper.curve[0]).to.equal(1);
				expect(waveshaper.curve[2]).to.equal(3);
			});

			it ("can be constructed with a mapping function", function(){
				var waveshaper = new WaveShaper(function(){
					return -2;
				});
				expect(waveshaper.curve[0]).to.equal(-2);
				expect(waveshaper.curve[1]).to.equal(-2);
			});

			it ("can be constructed with a length and then set with a map", function(){
				var waveshaper = new WaveShaper(2048).setMap(function(){
					return 10;
				});
				expect(waveshaper.curve.length).to.equal(2048);
				expect(waveshaper.curve[0]).to.equal(10);
				expect(waveshaper.curve[1]).to.equal(10);
			});

			it ("can be set to oversample", function(){
				var waveshaper = new WaveShaper();
				expect(waveshaper.oversample).to.equal("none");
				waveshaper.oversample = "2x";
				expect(waveshaper.oversample).to.equal("2x");
				expect(function(){
					waveshaper.oversample = "3x";
				}).to.throw(Error);
			});
			
		});

		describe("Logic", function(){

			it("shapes the output of the incoming signal", function(done){
				var signal, waveshaper;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(1);
					waveshaper = new WaveShaper([-10, -10, -10]);
					signal.connect(waveshaper);
					waveshaper.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(-10);
				});
				offline.after(function(){
					signal.dispose();
					waveshaper.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the last curve value when the input is above 1", function(done){
				var signal, waveshaper;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(10);
					waveshaper = new WaveShaper([-20, 20]);
					signal.connect(waveshaper);
					waveshaper.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(20);
				});
				offline.after(function(){
					signal.dispose();
					waveshaper.dispose();
					done();
				});
				offline.run();
			});

			it("outputs the first curve value when the input is below -1", function(done){
				var signal, waveshaper;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-1);
					waveshaper = new WaveShaper([-20, 20]);
					signal.connect(waveshaper);
					waveshaper.connect(dest);
				});
				offline.test(function(sample){
					expect(sample).to.equal(-20);
				});
				offline.after(function(){
					signal.dispose();
					waveshaper.dispose();
					done();
				});
				offline.run();
			});

			it("maps the input through the waveshaping curve", function(done){
				var signal, waveshaper;
				var offline = new Offline();
				offline.before(function(dest){
					signal = new Signal(-1);
					waveshaper = new WaveShaper(function(input){
						return input * 2;
					});
					signal.connect(waveshaper);
					waveshaper.connect(dest);
					signal.setValueAtTime(-1, 0);
					signal.linearRampToValueAtTime(1, 1);
				});
				offline.test(function(sample, time){
					expect(sample).to.be.closeTo( 2 * ((time * 2) - 1), 0.005);
				});
				offline.after(function(){
					signal.dispose();
					waveshaper.dispose();
					done();
				});
				offline.run();
			});

		});
	});
});