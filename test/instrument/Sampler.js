define(["Tone/instrument/Sampler", "helper/Basic", "helper/InstrumentTests",
	"Tone/core/Buffer", "helper/Offline"],
function (Sampler, Basic, InstrumentTest, Buffer, Offline) {

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

	describe("Sampler", function(){

		var A4_buffer = new Buffer();

		beforeEach(function(done){
			A4_buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		Basic(Sampler);

		InstrumentTest(Sampler, "A4", {
			69 : A4_buffer
		}, 1);

		context("Constructor", function(){

			it("can be constructed with an options object", function(){
				var sampler = new Sampler({
					69 : A4_buffer
				}, {
					"attack" : 0.2,
					"release" : 0.3
				});
				expect(sampler.attack).to.equal(0.2);
				expect(sampler.release).to.equal(0.3);
				sampler.dispose();
			});

			it("urls can be described as either midi or notes", function(){
				return Offline(function(){
					var sampler = new Sampler({
						"A4" : A4_buffer
					}).toMaster();
					sampler.triggerAttack("A4");
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.false;
				});
			});

			it("throws an error if the url key is not midi or pitch notation", function(){
				expect(function(){
					var sampler = new Sampler({
						"note" : A4_buffer
					});
				}).throws(Error);
			});

			it("can get and set envelope attributes", function(){
				var sampler = new Sampler();
				sampler.attack = 0.1;
				sampler.release = 0.1;
				expect(sampler.attack).to.equal(0.1);
				expect(sampler.release).to.equal(0.1);
				sampler.dispose();
			});

			it("invokes the callback when loaded", function(done){
				var sampler = new Sampler({
					"A4" : "./audio/sine.wav"
				}, function(){
					expect(sampler.loaded).to.be.true;
					done();
				});
			});

			it("can pass in a callback and baseUrl", function(done){
				var sampler = new Sampler({
					"A4" : A4_buffer
				}, function(){
					// expect(sampler.loaded).to.be.true;
					done();
				}, "./baseUrl");
			});

		});

		context("Makes sound", function(){

			it("repitches the note", function(){
				return Offline(function(){
					var sampler = new Sampler({
						"A4" : A4_buffer
					}).toMaster();
					sampler.triggerAttack("G4");
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.false;
				});
			});

			it("repitches the note only up to 2 octaves", function(){
				return Offline(function(){
					var sampler = new Sampler({
						"A4" : A4_buffer
					}).toMaster();
					sampler.triggerAttack("A#6");
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.true;
				});
			});

			it("is silent after the release", function(){
				return Offline(function(){
					var sampler = new Sampler({
						"A4" : A4_buffer
					}, {
						release : 0
					}).toMaster();
					sampler.triggerAttack("A4", 0);
					sampler.triggerRelease("A4", 0.2);
				}, 0.3).then(function(buffer){
					expect(buffer.getLastSoundTime()).to.be.closeTo(0.2, 0.01);
				});
			});

			it("can release multiple notes", function(){
				return Offline(function(){
					var sampler = new Sampler({
						"A4" : A4_buffer
					}, {
						release : 0
					}).toMaster();
					sampler.triggerAttack("A4", 0);
					sampler.triggerAttack("C4", 0);
					sampler.triggerAttack("A4", 0.1);
					sampler.triggerAttack("G4", 0.1);
					sampler.releaseAll(0.2);
				}, 0.3).then(function(buffer){
					expect(buffer.getLastSoundTime()).to.be.closeTo(0.2, 0.01);
				});
			});

			it("can trigger the attack and release", function(){
				return Offline(function(){
					var sampler = new Sampler({
						"A4" : A4_buffer
					}, {
						release : 0
					}).toMaster();
					sampler.triggerAttackRelease("A4", 0.2, 0.1);
				}, 0.4).then(function(buffer){
					expect(buffer.getFirstSoundTime()).to.be.closeTo(0.1, 0.01);
					expect(buffer.getLastSoundTime()).to.be.closeTo(0.3, 0.01);
				});
			});
		});

		context("add samples", function(){

			it("can add a note with it's midi value", function(){
				return Offline(function(){
					var sampler = new Sampler().toMaster();
					sampler.add("69", A4_buffer);
					sampler.triggerAttack("B4");
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.false;
				});
			});

			it("can add a note with it's note name", function(){
				return Offline(function(){
					var sampler = new Sampler().toMaster();
					sampler.add("A4", A4_buffer);
					sampler.triggerAttack("G4");
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.false;
				});
			});

			it("can pass in a url and invokes the callback", function(done){
				var sampler = new Sampler();
				sampler.add("A4", "./audio/sine.wav", function(){
					done();
				});
			});

			it("throws an error if added note key is not midi or note name", function(){
				expect(function(){
					var sampler = new Sampler().toMaster();
					sampler.add("nope", A4_buffer);
				}).throws(Error);
			});
		});

	});
});
