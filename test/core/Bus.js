define(["Test", "Tone/core/Bus", "Tone/core/Tone", "helper/Offline2", 
	"helper/PassAudio", "Tone/signal/Signal", "Tone/core/Gain"], 
	function (Test, Bus, Tone, Offline, PassAudio, Signal, Gain) {

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

		it ("passes audio from a send to a receive at the given level", function(done){
			Offline(function(output, test, after){

				var sig = new Signal(1);
				var recv = new Gain().connect(output);
				sig.send("test", -12);
				recv.receive("test");

				test(function(sample){
					expect(sample).to.be.closeTo(0.25, 0.1);
				});

				after(function(){
					sig.dispose();
					recv.dispose();
					done();
				});
			}, 0.2);
		});		
	});
});