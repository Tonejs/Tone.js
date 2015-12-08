define(["helper/Basic", "Tone/source/OmniOscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests", "helper/OutputAudio"], 
	function (BasicTests, OmniOscillator, Offline, SourceTests, OscillatorTests, OutputAudio) {

	describe("OmniOscillator", function(){

		//run the common tests
		BasicTests(OmniOscillator);
		SourceTests(OmniOscillator);
		OscillatorTests(OmniOscillator);	

		context("Sound", function(){

			it("makes a sound", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator();
					osc.connect(dest);
					osc.start();
				}, function(){
					osc.dispose();
					done();
				});
			});		

			it("makes a sound when set to square", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator(440, "square");
					osc.connect(dest);
					osc.start();
				}, function(){
					osc.dispose();
					done();
				});
			});		

			it("makes a sound when set to pulse", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator(440, "pulse");
					osc.connect(dest);
					osc.start();
				}, function(){
					osc.dispose();
					done();
				});
			});		

			it("makes a sound when set to pwm", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator(440, "pwm");
					osc.connect(dest);
					osc.start();
				}, function(){
					osc.dispose();
					done();
				});
			});		

		});

		context("Type", function(){

			it ("can get and set the type", function(){
				var osc = new OmniOscillator({
					"type" : "sawtooth",
				});
				expect(osc.type).to.equal("sawtooth");
				osc.dispose();
			});

			it ("handles 6 types", function(){
				var osc = new OmniOscillator();
				var types = ["triangle", "sawtooth", "sine", "square", "pulse", "pwm"];
				for (var i = 0; i < types.length; i++){
					osc.type = types[i];
					expect(osc.type).to.equal(types[i]);
				}
				osc.dispose();
			});

			it ("throws an error if invalid type is set", function(){
				var osc = new OmniOscillator();
				expect(function(){
					osc.type = "invalid";
				}).to.throw(Error);
				osc.dispose();
			});

			it ("can set extended types", function(){
				var osc = new OmniOscillator();
				osc.type = "sine5";
				expect(osc.type).to.equal("sine5");
				osc.type = "triangle2";
				expect(osc.type).to.equal("triangle2");
				osc.dispose();
			});

			it("can set the modulation frequency only when type is pwm", function(){
				var omni = new OmniOscillator();
				omni.type = "pwm";
				expect(function(){
					omni.modulationFrequency.value = 0.2;
				}).to.not.throw(Error);
				omni.type = "pulse";
				expect(function(){
					omni.modulationFrequency.value = 0.2;
				}).to.throw(Error);
				omni.dispose();
			});

			it("can set the modulation width only when type is pulse", function(){
				var omni = new OmniOscillator();
				omni.type = "pulse";
				expect(function(){
					omni.width.value = 0.2;
				}).to.not.throw(Error);
				omni.type = "sine";
				expect(function(){
					omni.width.value = 0.2;
				}).to.throw(Error);
				omni.dispose();
			});
		});
	});
});