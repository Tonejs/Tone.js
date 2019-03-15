import BasicTests from "helper/Basic";
import Noise from "Tone/source/Noise";
import SourceTests from "helper/SourceTests";
import OutputAudio from "helper/OutputAudio";
import CompareToFile from "helper/CompareToFile";

describe("Noise", function(){

	//run the common tests
	BasicTests(Noise);
	SourceTests(Noise);

	it("matches a file", function(){
		return CompareToFile(function(){
			var noise = new Noise().toMaster();
			noise.start(0.1).stop(0.2);
		}, "noise.wav", 9);
	});

	context("Get/Set", function(){

		it("can be constructed with an options object", function(){
			var noise = new Noise({
				"type" : "brown"
			});
			expect(noise.type).to.equal("brown");
			noise.dispose();
		});

		it("can set the playbackRate in the constructor", function(){
			var noise = new Noise({
				"playbackRate" : 2
			});
			expect(noise.playbackRate).to.equal(2);
			noise.dispose();
		});

		it("can set the playbackRate after the noise is started", function(){
			return OutputAudio(function(){
				var noise = new Noise().toMaster();
				noise.start();
				noise.playbackRate = 3;
				expect(noise.playbackRate).to.equal(3);
			});
		});

	});

	context("Type", function(){

		it("can be set to 3 noise types", function(){
			var noise = new Noise();
			var types = ["white", "brown", "pink"];
			for (var i = 0; i < types.length; i++){
				noise.type = types[i];
				expect(noise.type).to.equal(types[i]);

			}
			noise.dispose();
		});

		it("cant set invalid type", function(){
			var noise = new Noise();
			expect(function(){
				noise.type = "else";
			}).to.throw(Error);
			noise.dispose();
		});

		it("outputs white noise", function(){
			return OutputAudio(function(){
				var noise = new Noise("white");
				noise.toMaster();
				noise.start();
			});
		});

		it("outputs pink noise", function(){
			return OutputAudio(function(){
				var noise = new Noise("pink");
				noise.toMaster();
				noise.start();
			});
		});

		it("outputs brown noise", function(){
			return OutputAudio(function(){
				var noise = new Noise("brown");
				noise.toMaster();
				noise.start();
			});
		});

		it("can set the type after the noise is started", function(){
			return OutputAudio(function(){
				var noise = new Noise();
				noise.toMaster();
				noise.start();
				noise.type = "brown";
			});
		});
	});
});

