define(["Tone/source/Microphone", "helper/Basic", "Tone/source/ExternalInput"], 
	function (Microphone, Basic, ExternalInput) {

	describe("Microphone", function(){
		Basic(Microphone);

		it ("extends ExternalInput", function(){
			var mic = new Microphone();
			expect(mic).to.be.instanceOf(ExternalInput);
			mic.dispose();
		});

		it ("indicates if the browser has UserMedia support", function(){
			expect(Microphone.supported).to.be.a.boolean;
		});
	});
});