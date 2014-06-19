define(["chai", "Tone/source/Player", "tests/WebAudio"], function(chai, Player){
	var expect = chai.expect;

	describe("Tone.Player", function(){
		this.timeout(100);
		var player = new Player("./testAudio/kick.mp3");

		it("loads a file", function(done){
			player.load(function(){
				done();
			});
		});

		it("returns correct file duration", function(){
			expect(player.getDuration()).to.equal(0.2361678034067154);
		});

		it("plays a file", function(){
			var ended = false;
			player._onended = function(){
				ended = true;
			};
			expect(ended).to.equal(false);
			player.start();
			setTimeout(function(){
				expect(ended).to.equal(true);
				}, 0.5);
		});

	});


});