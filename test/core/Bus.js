define(["Test", "Tone/core/Bus", "Tone/core/Tone", "helper/Offline", "helper/PassAudio"], 
	function (Test, Bus, Tone, Offline, PassAudio) {

	describe("Bus", function(){
		it ("provides a send and receive method", function(){
			expect(Tone.prototype.send).is.a("function");
			expect(Tone.prototype.receive).is.a("function");
		});

		it ("passes audio from a send to a receive with the same name", function(done){
			var send, recv;
			PassAudio(function(input, output){
				//make them pass through nodes
				send = new Tone();
				recv = new Tone();
				send.input.connect(send.output);
				recv.input.connect(recv.output);
				input.connect(send);
				recv.connect(output);
				send.send("test");
				recv.receive("test");
			}, function(){
				send.dispose();
				recv.dispose();
				done();
			});
		});		
	});
});