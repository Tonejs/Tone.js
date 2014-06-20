define(["chai", "Tone/core/Tone", "Tone/core/Master", "Tone/core/Bus"], function(chai, Tone, Master, Bus){
	var expect = chai.expect;

	describe("AudioContext", function(){
		this.timeout(3000);

		it ("was created", function(){
			expect(Tone.context).to.be.instanceof(AudioContext);
		});

		it ("has OscillatorNode", function(){
			expect(Tone.context.createOscillator).to.be.instanceof(Function);
		});

		it ("clock running", function(done){
			var interval = setInterval(function(){
				if (Tone.context.currentTime > 0){
					clearInterval(interval);
					done();
				}
			}, 20);
		});

		it ("has current API", function(){
			expect(OscillatorNode.prototype.start).to.be.instanceof(Function);
			expect(AudioBufferSourceNode.prototype.start).to.be.instanceof(Function);
			expect(AudioContext.prototype.createGain).to.be.instanceof(Function);
		});

	});

	describe("Tone.Master", function(){
		it ("exists", function(){
			expect(Tone.Master).to.equal(Master);
		});
	});

	describe("Tone.Bus", function(){
		it ("exists", function(){
			expect(Bus).to.be.an("object");
		});

		it ("provides a send and receive method", function(){
			expect(Tone.prototype.send).is.a("function");
			expect(Tone.prototype.receive).is.a("function");
		});
	});
});