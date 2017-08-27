define(["Test", "Tone/core/Tone", "Tone/core/AudioNode", "helper/PassAudio"], function (Test, Tone, AudioNode) {

	describe("AudioNode", function(){

		it("can be created and disposed", function(){
			var node = new AudioNode();
			node.dispose();
			Test.wasDisposed(node);
		});

		it("handles input and output connections", function(){
			var node = new AudioNode();
			node.createInsOuts(1, 1);
			node.connect(Test);
			Test.connect(node);
			node.dispose();
		});

		it("can be constructed with an options object", function(){
			var context = new AudioContext();
			var node = new AudioNode({
				"context" : context,
			});
			expect(node.context).to.be.equal(context);
			node.dispose();
			return context.close();
		});

		it("reports its inputs and outputs", function(){
			var node = new AudioNode();
			node.createInsOuts(3, 2);
			expect(node.numberOfInputs).to.equal(3);
			expect(node.numberOfOutputs).to.equal(2);
			node.dispose();
		});

	});
});
