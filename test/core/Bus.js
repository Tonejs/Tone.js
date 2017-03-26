define(["Test", "Tone/core/Bus", "Tone/core/Tone", "helper/Offline", 
	"helper/PassAudio", "Tone/signal/Signal", "Tone/core/Gain"], 
	function (Test, Bus, Tone, Offline, PassAudio, Signal, Gain) {

	describe("Bus", function(){
		it ("provides a send and receive method", function(){
			expect(Tone.prototype.send).is.a("function");
			expect(Tone.prototype.receive).is.a("function");
		});

		it ("passes audio from a send to a receive with the same name", function(){
			return PassAudio(function(input){
				//make them pass through nodes
				var send = new Gain();
				var recv = new Gain().toMaster();
				input.connect(send);
				send.send("test");
				recv.receive("test");
			});
		});		

		it ("passes audio from a send to a receive at the given level", function(){
			return Offline(function(){
				var sig = new Signal(1);
				var recv = new Gain().toMaster();
				sig.send("test", -12);
				recv.receive("test");
			}, 0.2).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.closeTo(0.25, 0.1);
				});
			});
		});		
	});
});