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

			it("makes a sound when set to fm", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator(440, "fmsquare");
					osc.connect(dest);
					osc.start();
				}, function(){
					osc.dispose();
					done();
				});
			});		

			it("makes a sound when set to am", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator(440, "amsine");
					osc.connect(dest);
					osc.start();
				}, function(){
					osc.dispose();
					done();
				});
			});	

			it("makes a sound when set to fat", function(done){
				var osc;
				OutputAudio(function(dest){
					osc = new OmniOscillator(440, "fatsawtooth");
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

			it ("handles various types", function(){
				var osc = new OmniOscillator();
				var types = ["triangle3", "sine", "pulse", "pwm", "amsine4", "fatsquare2", "fmsawtooth"];
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

			it("can be set to an FM oscillator", function(){
				var omni = new OmniOscillator();
				omni.set({
					"type" : "fmsquare2",
					"modulationIndex" : 2
				});
				expect(omni.type).to.equal("fmsquare2");
				expect(omni.modulationIndex.value).to.equal(2);
				omni.dispose();
			});

			it("can be set to an AM oscillator", function(){
				var omni = new OmniOscillator();
				omni.set("type", "amsquare");
				omni.modulationType = "sawtooth2";
				expect(omni.type).to.equal("amsquare");
				expect(omni.modulationType).to.equal("sawtooth2");
				omni.dispose();
			});

			it("can be set to an FatOscillator", function(){
				var omni = new OmniOscillator({
					"type" : "fatsquare2",
					"count" : 3
				});
				expect(omni.type).to.equal("fatsquare2");
				expect(omni.count).to.equal(3);
				omni.dispose();
			});

			it ("can set a FM oscillator with partials", function(){
				var omni = new OmniOscillator({
					"detune": 4,
					"type": "fmcustom",
					"partials" : [2, 1, 2, 2],
					"phase": 120,
					"volume": -2
				});
				expect(omni.volume.value).to.be.closeTo(-2, 0.01);
				expect(omni.detune.value).to.be.closeTo(4, 0.01);
				expect(omni.phase).to.be.closeTo(120, 0.01);
				expect(omni.type).to.be.equal("fmcustom");
				expect(omni.partials).to.deep.equal([2, 1, 2, 2]);
				omni.dispose();
			});
		});
	});
});