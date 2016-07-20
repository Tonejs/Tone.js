define(["Tone/instrument/Sampler", "helper/Basic", "helper/InstrumentTests", "Tone/core/Buffer"], 
	function (Sampler, Basic, InstrumentTest, Buffer) {

	describe("Sampler", function(){

		var buffer = new Buffer();

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		Basic(Sampler);
		InstrumentTest(Sampler, 1, buffer);

		context("API", function(){

			it ("invokes the callback with the constructor", function(done){
				var sampler = new Sampler("./audio/sine.wav", function(){
					sampler.dispose();
					done();
				});
			});

			it ("can get and set envelope attributes", function(){
				var sampler = new Sampler();
				sampler.envelope.attack = 0.24;
				expect(sampler.envelope.attack).to.equal(0.24);
				sampler.dispose();
			});
			
			it ("can be constructed with an options object", function(){
				var sampler = new Sampler({
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(sampler.envelope.sustain).to.equal(0.3);
				sampler.dispose();
			});

			it ("can get/set attributes", function(){
				var sampler = new Sampler();
				sampler.set({
					"envelope.decay" : 0.24
				});
				expect(sampler.get().envelope.decay).to.equal(0.24);
				sampler.dispose();
			});

			it ("can set the buffer", function(){
				var sampler = new Sampler();
				sampler.buffer = buffer;
				expect(sampler.buffer.get()).to.equal(buffer.get());
				sampler.dispose();
			});

			it ("can be set to loop and reverse", function(){
				var sampler = new Sampler({
					loop : true,
					reverse : true,
				});
				expect(sampler.reverse).to.be.true;
				expect(sampler.loop).to.be.true;
				sampler.dispose();
			});

		});
	});
});